import { Client, ConnectConfig } from 'ssh2'

export interface SSHConnectionConfig {
  host: string
  port?: number
  username: string
  privateKey: string
}

export interface CommandResult {
  stdout: string
  stderr: string
  code: number
}

export class SSHConnection {
  private client: Client
  private config: ConnectConfig
  private isConnected: boolean = false

  constructor(config: SSHConnectionConfig) {
    this.client = new Client()
    this.config = {
      host: config.host,
      port: config.port || 22,
      username: config.username,
      privateKey: config.privateKey,
      readyTimeout: 30000,
      keepaliveInterval: 10000,
    }
  }

  /**
   * Connect to the SSH server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.on('ready', () => {
        this.isConnected = true
        resolve()
      })

      this.client.on('error', (err) => {
        this.isConnected = false
        reject(new Error(`SSH connection error: ${err.message}`))
      })

      this.client.connect(this.config)
    })
  }

  /**
   * Execute a command on the remote server
   */
  async exec(command: string, options?: { timeout?: number }): Promise<CommandResult> {
    if (!this.isConnected) {
      throw new Error('SSH not connected. Call connect() first.')
    }

    return new Promise((resolve, reject) => {
      const timeout = options?.timeout || 300000 // 5 minutes default

      const timer = setTimeout(() => {
        reject(new Error(`Command timed out after ${timeout}ms`))
      }, timeout)

      this.client.exec(command, (err, stream) => {
        if (err) {
          clearTimeout(timer)
          reject(err)
          return
        }

        let stdout = ''
        let stderr = ''

        stream.on('close', (code: number) => {
          clearTimeout(timer)
          resolve({ stdout, stderr, code })
        })

        stream.on('data', (data: Buffer) => {
          stdout += data.toString()
        })

        stream.stderr.on('data', (data: Buffer) => {
          stderr += data.toString()
        })
      })
    })
  }

  /**
   * Execute a command with sudo
   */
  async execSudo(command: string, options?: { timeout?: number }): Promise<CommandResult> {
    return this.exec(`sudo ${command}`, options)
  }

  /**
   * Execute a command as the frappe user
   */
  async execAsFrappe(command: string, options?: { timeout?: number }): Promise<CommandResult> {
    return this.exec(`sudo -u frappe bash -c '${command.replace(/'/g, "'\\''")}'`, options)
  }

  /**
   * Upload a file to the remote server
   */
  async uploadFile(localContent: string, remotePath: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('SSH not connected. Call connect() first.')
    }

    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        const writeStream = sftp.createWriteStream(remotePath)
        
        writeStream.on('close', () => {
          resolve()
        })

        writeStream.on('error', (err: Error) => {
          reject(err)
        })

        writeStream.write(localContent)
        writeStream.end()
      })
    })
  }

  /**
   * Download a file from the remote server
   */
  async downloadFile(remotePath: string): Promise<string> {
    if (!this.isConnected) {
      throw new Error('SSH not connected. Call connect() first.')
    }

    return new Promise((resolve, reject) => {
      this.client.sftp((err, sftp) => {
        if (err) {
          reject(err)
          return
        }

        let content = ''
        const readStream = sftp.createReadStream(remotePath)

        readStream.on('data', (chunk: Buffer) => {
          content += chunk.toString()
        })

        readStream.on('end', () => {
          resolve(content)
        })

        readStream.on('error', (err: Error) => {
          reject(err)
        })
      })
    })
  }

  /**
   * Check if a file exists on the remote server
   */
  async fileExists(remotePath: string): Promise<boolean> {
    try {
      const result = await this.exec(`test -f ${remotePath} && echo "exists"`)
      return result.stdout.trim() === 'exists'
    } catch {
      return false
    }
  }

  /**
   * Check if a directory exists on the remote server
   */
  async dirExists(remotePath: string): Promise<boolean> {
    try {
      const result = await this.exec(`test -d ${remotePath} && echo "exists"`)
      return result.stdout.trim() === 'exists'
    } catch {
      return false
    }
  }

  /**
   * Close the SSH connection
   */
  disconnect(): void {
    if (this.isConnected) {
      this.client.end()
      this.isConnected = false
    }
  }
}

/**
 * Test SSH connection to a server
 */
export async function testConnection(config: SSHConnectionConfig): Promise<{
  success: boolean
  message: string
  details?: {
    hostname?: string
    os?: string
    uptime?: string
  }
}> {
  const ssh = new SSHConnection(config)

  try {
    await ssh.connect()

    // Get server info
    const hostnameResult = await ssh.exec('hostname')
    const osResult = await ssh.exec('cat /etc/os-release | grep PRETTY_NAME | cut -d= -f2 | tr -d \'"\'')
    const uptimeResult = await ssh.exec('uptime -p')

    ssh.disconnect()

    return {
      success: true,
      message: 'Connection successful',
      details: {
        hostname: hostnameResult.stdout.trim(),
        os: osResult.stdout.trim(),
        uptime: uptimeResult.stdout.trim(),
      },
    }
  } catch (error) {
    ssh.disconnect()
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Connection failed',
    }
  }
}

/**
 * Check server health and resources
 */
export async function checkServerHealth(config: SSHConnectionConfig): Promise<{
  success: boolean
  data?: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    loadAverage: string
    uptime: string
  }
  error?: string
}> {
  const ssh = new SSHConnection(config)

  try {
    await ssh.connect()

    // Get CPU usage
    const cpuResult = await ssh.exec("top -bn1 | grep 'Cpu(s)' | awk '{print $2}' | cut -d'%' -f1")
    
    // Get memory usage
    const memResult = await ssh.exec("free | grep Mem | awk '{print ($3/$2) * 100}'")
    
    // Get disk usage
    const diskResult = await ssh.exec("df -h / | tail -1 | awk '{print $5}' | tr -d '%'")
    
    // Get load average
    const loadResult = await ssh.exec('cat /proc/loadavg | cut -d" " -f1-3')
    
    // Get uptime
    const uptimeResult = await ssh.exec('uptime -p')

    ssh.disconnect()

    return {
      success: true,
      data: {
        cpuUsage: parseFloat(cpuResult.stdout.trim()) || 0,
        memoryUsage: parseFloat(memResult.stdout.trim()) || 0,
        diskUsage: parseFloat(diskResult.stdout.trim()) || 0,
        loadAverage: loadResult.stdout.trim(),
        uptime: uptimeResult.stdout.trim(),
      },
    }
  } catch (error) {
    ssh.disconnect()
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Health check failed',
    }
  }
}

/**
 * Get list of sites on a Frappe bench
 */
export async function getBenchSites(
  config: SSHConnectionConfig,
  benchPath: string
): Promise<{
  success: boolean
  sites?: string[]
  error?: string
}> {
  const ssh = new SSHConnection(config)

  try {
    await ssh.connect()

    const result = await ssh.exec(`ls -1 ${benchPath}/sites | grep -v assets | grep -v apps.txt | grep -v common_site_config.json`)

    ssh.disconnect()

    const sites = result.stdout
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    return {
      success: true,
      sites,
    }
  } catch (error) {
    ssh.disconnect()
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sites',
    }
  }
}

/**
 * Check if Frappe bench is installed
 */
export async function isBenchInstalled(
  config: SSHConnectionConfig,
  benchPath: string
): Promise<boolean> {
  const ssh = new SSHConnection(config)

  try {
    await ssh.connect()
    const exists = await ssh.dirExists(benchPath)
    ssh.disconnect()
    return exists
  } catch {
    ssh.disconnect()
    return false
  }
}
