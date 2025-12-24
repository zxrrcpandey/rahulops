/**
 * Trigger.dev Background Jobs
 * 
 * This file contains all background job definitions for:
 * - Site deployment
 * - Server setup
 * - Backup management
 * - Auto-suspension/reactivation
 * - Health monitoring
 * - Email notifications
 */

import { TriggerClient, cronTrigger, eventTrigger } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";

// Initialize Trigger.dev client
export const client = new TriggerClient({
  id: "rahulops",
  apiKey: process.env.TRIGGER_API_KEY!,
  apiUrl: process.env.TRIGGER_API_URL,
});

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// SITE DEPLOYMENT JOB
// ============================================================================

client.defineJob({
  id: "deploy-site",
  name: "Deploy ERPNext Site",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "site.deploy",
  }),
  run: async (payload, io, ctx) => {
    const { 
      jobId, 
      siteId, 
      serverId, 
      siteName, 
      apps, 
      adminPassword,
      setupSsl,
      serverDetails 
    } = payload;

    await io.logger.info("Starting site deployment", { siteName, serverId });

    // Update job status
    await io.runTask("update-job-started", async () => {
      await supabase
        .from("deployment_jobs")
        .update({ 
          status: "running", 
          started_at: new Date().toISOString(),
          current_step: "Connecting to server"
        })
        .eq("id", jobId);
    });

    try {
      // Step 1: Create site
      await io.runTask("create-site", async () => {
        await updateJobProgress(jobId, 10, "Creating new site");
        
        const result = await executeSSHCommand(serverDetails, `
          cd ${serverDetails.benchPath}
          bench new-site ${siteName} \
            --admin-password "${adminPassword}" \
            --mariadb-root-password "${serverDetails.mariadbRootPassword}"
        `);
        
        if (!result.success) {
          throw new Error(`Failed to create site: ${result.error}`);
        }
        
        return result;
      });

      // Step 2: Install apps
      await io.runTask("install-apps", async () => {
        await updateJobProgress(jobId, 30, "Installing apps");
        
        for (const app of apps) {
          await updateJobProgress(jobId, 30, `Installing ${app}`);
          
          const result = await executeSSHCommand(serverDetails, `
            cd ${serverDetails.benchPath}
            bench --site ${siteName} install-app ${app}
          `);
          
          if (!result.success) {
            await io.logger.warn(`Failed to install app ${app}`, { error: result.error });
          }
        }
      });

      // Step 3: Enable scheduler
      await io.runTask("enable-scheduler", async () => {
        await updateJobProgress(jobId, 60, "Enabling scheduler");
        
        await executeSSHCommand(serverDetails, `
          cd ${serverDetails.benchPath}
          bench --site ${siteName} enable-scheduler
          bench --site ${siteName} set-maintenance-mode off
        `);
      });

      // Step 4: Setup nginx
      await io.runTask("setup-nginx", async () => {
        await updateJobProgress(jobId, 70, "Configuring nginx");
        
        await executeSSHCommand(serverDetails, `
          cd ${serverDetails.benchPath}
          bench setup nginx --yes
          sudo systemctl reload nginx
        `);
      });

      // Step 5: Setup SSL (if enabled)
      if (setupSsl) {
        await io.runTask("setup-ssl", async () => {
          await updateJobProgress(jobId, 85, "Setting up SSL certificate");
          
          const result = await executeSSHCommand(serverDetails, `
            sudo certbot --nginx -d ${siteName} --non-interactive --agree-tos --email ${process.env.SSL_EMAIL}
          `);
          
          if (result.success) {
            await supabase
              .from("sites")
              .update({ ssl_enabled: true })
              .eq("id", siteId);
          }
        });
      }

      // Step 6: Restart services
      await io.runTask("restart-services", async () => {
        await updateJobProgress(jobId, 95, "Restarting services");
        
        await executeSSHCommand(serverDetails, `
          sudo supervisorctl restart all
        `);
      });

      // Mark as completed
      await io.runTask("mark-completed", async () => {
        await supabase
          .from("deployment_jobs")
          .update({
            status: "completed",
            progress: 100,
            current_step: "Deployment completed",
            completed_at: new Date().toISOString()
          })
          .eq("id", jobId);

        await supabase
          .from("sites")
          .update({
            status: "active",
            deployment_completed_at: new Date().toISOString()
          })
          .eq("id", siteId);
      });

      // Send notification email
      await io.sendEvent("send-notification", {
        name: "notification.send",
        payload: {
          type: "deployment_success",
          siteId,
          siteName,
          adminPassword
        }
      });

      return { success: true, siteName };

    } catch (error) {
      await io.logger.error("Deployment failed", { error: String(error) });
      
      await supabase
        .from("deployment_jobs")
        .update({
          status: "failed",
          error_message: String(error),
          completed_at: new Date().toISOString()
        })
        .eq("id", jobId);

      await supabase
        .from("sites")
        .update({ status: "failed" })
        .eq("id", siteId);

      throw error;
    }
  },
});

// ============================================================================
// SERVER SETUP JOB
// ============================================================================

client.defineJob({
  id: "setup-server",
  name: "Setup New Server",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "server.setup",
  }),
  run: async (payload, io, ctx) => {
    const { serverId, serverDetails, appsToInstall, customApps } = payload;

    await io.logger.info("Starting server setup", { serverId });

    // This would SSH into the server and run the setup script
    // In production, you'd execute the server-setup.sh script via SSH
    
    await io.runTask("run-setup-script", async () => {
      await supabase
        .from("servers")
        .update({ status: "setup_running" })
        .eq("id", serverId);

      // Execute server setup script
      // This is a placeholder - actual implementation would use SSH
      const setupCommand = `
        export FRAPPE_USER="${serverDetails.sshUser}"
        export MARIADB_ROOT_PASSWORD="${serverDetails.mariadbPassword}"
        export APPS_TO_INSTALL="${appsToInstall.join(' ')}"
        export CUSTOM_APPS="${customApps || ''}"
        
        curl -O https://raw.githubusercontent.com/yourusername/erpnext-deployer/main/scripts/server-setup.sh
        chmod +x server-setup.sh
        sudo ./server-setup.sh
      `;

      await io.logger.info("Would execute setup script", { setupCommand });
    });

    await supabase
      .from("servers")
      .update({
        status: "active",
        setup_completed_at: new Date().toISOString(),
        installed_apps: appsToInstall
      })
      .eq("id", serverId);

    return { success: true };
  },
});

// ============================================================================
// BACKUP JOB
// ============================================================================

client.defineJob({
  id: "backup-site",
  name: "Backup Site",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "backup.create",
  }),
  run: async (payload, io, ctx) => {
    const { siteId, siteName, serverId, backupType = "full" } = payload;

    await io.logger.info("Starting backup", { siteName, backupType });

    // Get server details
    const { data: server } = await supabase
      .from("servers")
      .select("*")
      .eq("id", serverId)
      .single();

    if (!server) {
      throw new Error("Server not found");
    }

    // Create backup record
    const { data: backup } = await supabase
      .from("backups")
      .insert({
        site_id: siteId,
        backup_type: backupType,
        trigger_type: "manual",
        status: "running"
      })
      .select()
      .single();

    try {
      // Execute backup command
      const backupResult = await io.runTask("execute-backup", async () => {
        const flags = backupType === "full" ? "--with-files" : "";
        
        const result = await executeSSHCommand({
          ip: server.ip_address,
          sshUser: server.ssh_user,
          sshPort: server.ssh_port,
          benchPath: server.bench_path
        }, `
          cd ${server.bench_path}
          bench --site ${siteName} backup ${flags}
        `);

        return result;
      });

      // Get backup file size
      const fileInfo = await io.runTask("get-file-info", async () => {
        const result = await executeSSHCommand({
          ip: server.ip_address,
          sshUser: server.ssh_user,
          sshPort: server.ssh_port,
          benchPath: server.bench_path
        }, `
          ls -la ${server.bench_path}/sites/${siteName}/private/backups/ | tail -1
        `);

        return result;
      });

      // Update backup record
      await supabase
        .from("backups")
        .update({
          status: "completed",
          file_path: `/sites/${siteName}/private/backups/`,
          file_size_mb: 0, // Would parse from fileInfo
          completed_at: new Date().toISOString()
        })
        .eq("id", backup.id);

      return { success: true, backupId: backup.id };

    } catch (error) {
      await supabase
        .from("backups")
        .update({
          status: "failed",
          error_message: String(error),
          completed_at: new Date().toISOString()
        })
        .eq("id", backup.id);

      throw error;
    }
  },
});

// ============================================================================
// SCHEDULED BACKUP JOB (CRON)
// ============================================================================

client.defineJob({
  id: "scheduled-backups",
  name: "Run Scheduled Backups",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 2 * * *", // Run at 2 AM UTC daily
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Running scheduled backups");

    // Get all active backup schedules for today
    const { data: schedules } = await supabase
      .from("backup_schedules")
      .select(`
        *,
        sites (
          id,
          site_name,
          server_id
        )
      `)
      .eq("is_active", true);

    if (!schedules || schedules.length === 0) {
      await io.logger.info("No scheduled backups for today");
      return { backupsTriggered: 0 };
    }

    let backupsTriggered = 0;

    for (const schedule of schedules) {
      // Check if this schedule should run today
      const shouldRun = checkScheduleFrequency(schedule.frequency);
      
      if (shouldRun && schedule.sites) {
        await io.sendEvent(`backup-${schedule.sites.id}`, {
          name: "backup.create",
          payload: {
            siteId: schedule.sites.id,
            siteName: schedule.sites.site_name,
            serverId: schedule.sites.server_id,
            backupType: schedule.backup_type
          }
        });
        
        backupsTriggered++;
        
        // Update last run
        await supabase
          .from("backup_schedules")
          .update({ last_run_at: new Date().toISOString() })
          .eq("id", schedule.id);
      }
    }

    return { backupsTriggered };
  },
});

// ============================================================================
// AUTO-SUSPENSION JOB (CRON)
// ============================================================================

client.defineJob({
  id: "check-subscriptions",
  name: "Check Subscription Expiry & Auto-Suspend",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "0 0 * * *", // Run at midnight UTC daily
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Checking subscription expiry");

    // Get settings
    const { data: settings } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "auto_suspension")
      .single();

    const autoSuspendEnabled = settings?.value?.enabled ?? true;
    const gracePeriodDays = settings?.value?.grace_period_days ?? 3;
    const sendReminders = settings?.value?.send_reminders ?? true;

    if (!autoSuspendEnabled) {
      await io.logger.info("Auto-suspension is disabled");
      return { action: "skipped", reason: "Auto-suspension disabled" };
    }

    const today = new Date();
    const gracePeriodDate = new Date(today);
    gracePeriodDate.setDate(gracePeriodDate.getDate() - gracePeriodDays);

    // Get sites with expired subscriptions past grace period
    const { data: expiredSites } = await supabase
      .from("sites")
      .select(`
        *,
        clients (id, name, email)
      `)
      .eq("status", "active")
      .lt("subscription_expires_at", gracePeriodDate.toISOString());

    let suspendedCount = 0;
    let remindersSent = 0;

    // Suspend expired sites
    if (expiredSites) {
      for (const site of expiredSites) {
        await io.runTask(`suspend-${site.id}`, async () => {
          // Suspend the site
          await supabase
            .from("sites")
            .update({
              status: "suspended",
              suspended_at: new Date().toISOString(),
              suspension_reason: "Subscription expired"
            })
            .eq("id", site.id);

          // Execute suspension on server
          const { data: server } = await supabase
            .from("servers")
            .select("*")
            .eq("id", site.server_id)
            .single();

          if (server) {
            await executeSSHCommand({
              ip: server.ip_address,
              sshUser: server.ssh_user,
              sshPort: server.ssh_port,
              benchPath: server.bench_path
            }, `
              cd ${server.bench_path}
              bench --site ${site.site_name} set-maintenance-mode on
              bench --site ${site.site_name} disable-scheduler
            `);
          }

          // Log activity
          await supabase
            .from("activity_log")
            .insert({
              entity_type: "site",
              entity_id: site.id,
              action: "site_suspended",
              details: { reason: "Subscription expired", auto: true }
            });

          suspendedCount++;
        });

        // Send suspension notification
        if (sendReminders && site.clients) {
          await io.sendEvent(`notify-suspension-${site.id}`, {
            name: "notification.send",
            payload: {
              type: "site_suspended",
              to: site.clients.email,
              siteName: site.site_name,
              clientName: site.clients.name
            }
          });
        }
      }
    }

    // Send reminders for sites expiring soon
    if (sendReminders) {
      const reminderDays = [7, 3, 1, 0]; // Days before expiry to send reminders
      
      for (const days of reminderDays) {
        const targetDate = new Date(today);
        targetDate.setDate(targetDate.getDate() + days);
        
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: expiringSites } = await supabase
          .from("sites")
          .select(`
            *,
            clients (id, name, email)
          `)
          .eq("status", "active")
          .gte("subscription_expires_at", startOfDay.toISOString())
          .lte("subscription_expires_at", endOfDay.toISOString())
          .eq("reminder_sent_at", null); // Only if reminder not already sent

        if (expiringSites) {
          for (const site of expiringSites) {
            if (site.clients) {
              await io.sendEvent(`reminder-${site.id}`, {
                name: "notification.send",
                payload: {
                  type: "subscription_expiring",
                  to: site.clients.email,
                  siteName: site.site_name,
                  clientName: site.clients.name,
                  daysLeft: days,
                  expiryDate: site.subscription_expires_at
                }
              });

              await supabase
                .from("sites")
                .update({ reminder_sent_at: new Date().toISOString() })
                .eq("id", site.id);

              remindersSent++;
            }
          }
        }
      }
    }

    return { suspendedCount, remindersSent };
  },
});

// ============================================================================
// SITE REACTIVATION JOB
// ============================================================================

client.defineJob({
  id: "reactivate-site",
  name: "Reactivate Suspended Site",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "site.reactivate",
  }),
  run: async (payload, io, ctx) => {
    const { siteId, newExpiryDate } = payload;

    await io.logger.info("Reactivating site", { siteId });

    // Get site details
    const { data: site } = await supabase
      .from("sites")
      .select(`
        *,
        servers (*)
      `)
      .eq("id", siteId)
      .single();

    if (!site) {
      throw new Error("Site not found");
    }

    if (!site.servers) {
      throw new Error("Server not found");
    }

    // Reactivate on server
    await io.runTask("reactivate-on-server", async () => {
      await executeSSHCommand({
        ip: site.servers.ip_address,
        sshUser: site.servers.ssh_user,
        sshPort: site.servers.ssh_port,
        benchPath: site.servers.bench_path
      }, `
        cd ${site.servers.bench_path}
        bench --site ${site.site_name} set-maintenance-mode off
        bench --site ${site.site_name} enable-scheduler
      `);
    });

    // Update database
    await supabase
      .from("sites")
      .update({
        status: "active",
        suspended_at: null,
        suspension_reason: null,
        subscription_expires_at: newExpiryDate,
        reminder_sent_at: null
      })
      .eq("id", siteId);

    // Log activity
    await supabase
      .from("activity_log")
      .insert({
        entity_type: "site",
        entity_id: siteId,
        action: "site_reactivated",
        details: { newExpiryDate }
      });

    // Send confirmation email
    await io.sendEvent("notify-reactivation", {
      name: "notification.send",
      payload: {
        type: "site_reactivated",
        siteId,
        siteName: site.site_name
      }
    });

    return { success: true };
  },
});

// ============================================================================
// HEALTH CHECK JOB (CRON)
// ============================================================================

client.defineJob({
  id: "health-check",
  name: "Server Health Check",
  version: "1.0.0",
  trigger: cronTrigger({
    cron: "*/5 * * * *", // Every 5 minutes
  }),
  run: async (payload, io, ctx) => {
    await io.logger.info("Running health checks");

    // Get all active servers
    const { data: servers } = await supabase
      .from("servers")
      .select("*")
      .eq("status", "active");

    if (!servers) {
      return { checked: 0 };
    }

    const results = [];

    for (const server of servers) {
      const health = await io.runTask(`check-${server.id}`, async () => {
        try {
          // Check SSH connectivity
          const sshResult = await executeSSHCommand({
            ip: server.ip_address,
            sshUser: server.ssh_user,
            sshPort: server.ssh_port,
            benchPath: server.bench_path
          }, `
            echo "CPU:$(top -bn1 | grep 'Cpu(s)' | awk '{print $2}')"
            echo "RAM:$(free -m | awk 'NR==2{printf "%.1f", $3*100/$2 }')"
            echo "DISK:$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')"
            echo "UPTIME:$(uptime -p)"
          `);

          if (!sshResult.success) {
            return {
              serverId: server.id,
              status: "offline",
              error: sshResult.error
            };
          }

          // Parse results
          const lines = sshResult.output?.split('\n') || [];
          const cpu = parseFloat(lines.find(l => l.startsWith('CPU:'))?.split(':')[1] || '0');
          const ram = parseFloat(lines.find(l => l.startsWith('RAM:'))?.split(':')[1] || '0');
          const disk = parseFloat(lines.find(l => l.startsWith('DISK:'))?.split(':')[1] || '0');

          // Determine status
          let status = "healthy";
          if (cpu > 90 || ram > 90 || disk > 90) {
            status = "critical";
          } else if (cpu > 70 || ram > 70 || disk > 80) {
            status = "warning";
          }

          return {
            serverId: server.id,
            status,
            cpu,
            ram,
            disk
          };

        } catch (error) {
          return {
            serverId: server.id,
            status: "offline",
            error: String(error)
          };
        }
      });

      results.push(health);

      // Update server record
      await supabase
        .from("servers")
        .update({
          last_health_check: new Date().toISOString(),
          health_status: health.status,
          cpu_usage: health.cpu,
          ram_usage: health.ram,
          disk_usage: health.disk
        })
        .eq("id", server.id);

      // Alert if critical
      if (health.status === "critical" || health.status === "offline") {
        await io.sendEvent(`alert-${server.id}`, {
          name: "notification.send",
          payload: {
            type: "server_alert",
            serverId: server.id,
            serverName: server.name,
            status: health.status,
            details: health
          }
        });
      }
    }

    return { checked: servers.length, results };
  },
});

// ============================================================================
// EMAIL NOTIFICATION JOB
// ============================================================================

client.defineJob({
  id: "send-notification",
  name: "Send Email Notification",
  version: "1.0.0",
  trigger: eventTrigger({
    name: "notification.send",
  }),
  run: async (payload, io, ctx) => {
    const { type, to, ...data } = payload;

    await io.logger.info("Sending notification", { type, to });

    // Get email template based on type
    const templates: Record<string, { subject: string; body: string }> = {
      deployment_success: {
        subject: "🎉 Site Deployed Successfully - {{siteName}}",
        body: `Your ERPNext site {{siteName}} has been deployed successfully.\n\nLogin URL: https://{{siteName}}\nUsername: Administrator\nPassword: {{adminPassword}}\n\nPlease change your password after first login.`
      },
      subscription_expiring: {
        subject: "⚠️ Subscription Expiring Soon - {{siteName}}",
        body: `Dear {{clientName}},\n\nYour subscription for {{siteName}} will expire in {{daysLeft}} days on {{expiryDate}}.\n\nPlease renew to avoid service interruption.`
      },
      site_suspended: {
        subject: "🔴 Site Suspended - {{siteName}}",
        body: `Dear {{clientName}},\n\nYour site {{siteName}} has been suspended due to expired subscription.\n\nPlease renew your subscription to reactivate the site.`
      },
      site_reactivated: {
        subject: "✅ Site Reactivated - {{siteName}}",
        body: `Your site {{siteName}} has been reactivated successfully.\n\nYou can now access your site at https://{{siteName}}`
      },
      server_alert: {
        subject: "🚨 Server Alert - {{serverName}}",
        body: `Server {{serverName}} is reporting status: {{status}}\n\nDetails:\nCPU: {{details.cpu}}%\nRAM: {{details.ram}}%\nDisk: {{details.disk}}%`
      }
    };

    const template = templates[type];
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    // Replace placeholders
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'object') {
        for (const [subKey, subValue] of Object.entries(value as Record<string, any>)) {
          subject = subject.replace(`{{${key}.${subKey}}}`, String(subValue));
          body = body.replace(`{{${key}.${subKey}}}`, String(subValue));
        }
      } else {
        subject = subject.replace(`{{${key}}}`, String(value));
        body = body.replace(`{{${key}}}`, String(value));
      }
    }

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || "noreply@yourdomain.com",
        to: to || process.env.NOTIFICATION_EMAIL,
        subject,
        text: body,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send email: ${response.statusText}`);
    }

    return { success: true, type, to };
  },
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function updateJobProgress(jobId: string, progress: number, step: string) {
  await supabase
    .from("deployment_jobs")
    .update({ progress, current_step: step })
    .eq("id", jobId);
}

async function executeSSHCommand(
  serverDetails: {
    ip: string;
    sshUser: string;
    sshPort?: number;
    benchPath?: string;
  },
  command: string
): Promise<{ success: boolean; output?: string; error?: string }> {
  // In production, this would use an SSH library like ssh2
  // For now, this is a placeholder that would be implemented
  // based on your specific SSH connection requirements
  
  console.log(`Would execute on ${serverDetails.ip}:`, command);
  
  // Placeholder return - in production, actually execute the command
  return { success: true, output: "Command executed" };
}

function checkScheduleFrequency(frequency: string): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday
  const dayOfMonth = today.getDate();

  switch (frequency) {
    case "daily":
      return true;
    case "weekly":
      return dayOfWeek === 0; // Sunday
    case "monthly":
      return dayOfMonth === 1; // First of month
    default:
      return false;
  }
}

export default client;
