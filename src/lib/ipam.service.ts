import { Netmask } from 'netmask';
import type { AnyDevice, Subnet } from './types';

// We need to install the 'netmask' library: npm install netmask

export class IpamService {
  private subnet: Netmask;
  private usedIps: Set<string>;

  constructor(subnetConfig: Subnet, devices: AnyDevice[]) {
    this.subnet = new Netmask(subnetConfig.cidr);
    this.usedIps = new Set();

    // Initialize with already used IPs
    devices.forEach(device => {
      if (device.ipAddress && this.subnet.contains(device.ipAddress)) {
        this.usedIps.add(device.ipAddress);
      }
    });

    // Reserve gateway IP if it exists
    if (subnetConfig.gateway) {
        this.usedIps.add(subnetConfig.gateway);
    }
  }

  /**
   * Assigns the next available IP address from the subnet.
   * @returns The assigned IP address or null if the subnet is full.
   */
  public assignIp(): string | null {
    let nextIp = this.subnet.first;
    
    // Using a for loop with a reasonable limit to prevent infinite loops on full subnets
    for (let i = 0; i < this.subnet.size; i++) {
        if (!this.usedIps.has(nextIp)) {
            this.usedIps.add(nextIp);
            return nextIp;
        }
        
        const ipParts = nextIp.split('.').map(Number);
        ipParts[3]++;
        if (ipParts[3] > 255) { // Simple increment, needs to be more robust for larger subnets
            ipParts[2]++;
            ipParts[3] = 0;
        }
        nextIp = ipParts.join('.');
        
        if (!this.subnet.contains(nextIp)) {
             break; // Stop if we are outside the subnet range
        }
    }
    
    return null; // Subnet is likely full
  }

  /**
   * Releases an IP address, making it available for reassignment.
   * @param ipAddress The IP address to release.
   */
  public releaseIp(ipAddress: string): void {
    this.usedIps.delete(ipAddress);
  }
}
