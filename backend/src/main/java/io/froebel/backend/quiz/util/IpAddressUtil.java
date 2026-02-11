package io.froebel.backend.quiz.util;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * Utility class for IP address validation and CIDR matching.
 */
public final class IpAddressUtil {

    private IpAddressUtil() {
        // Utility class - prevent instantiation
    }

    /**
     * Check if clientIp is in the allowed list (newline or comma separated).
     * Supports individual IPs and CIDR notation (e.g., 192.168.1.0/24).
     *
     * @param clientIp           The client IP address to check
     * @param allowedIpAddresses Newline or comma-separated list of allowed IPs/CIDR ranges
     * @return true if the IP is allowed, false otherwise
     */
    public static boolean isIpInAllowedList(String clientIp, String allowedIpAddresses) {
        if (clientIp == null || allowedIpAddresses == null) {
            return false;
        }

        String[] allowedEntries = allowedIpAddresses.split("[\\r\\n,]+");

        for (String entry : allowedEntries) {
            String trimmed = entry.trim();
            if (trimmed.isEmpty()) {
                continue;
            }

            if (trimmed.contains("/")) {
                // CIDR notation
                if (isIpInCidrRange(clientIp, trimmed)) {
                    return true;
                }
            } else {
                // Exact match
                if (trimmed.equals(clientIp)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Check if IP is within CIDR range (e.g., 192.168.1.0/24).
     *
     * @param ip   The IP address to check
     * @param cidr The CIDR range (e.g., "192.168.1.0/24")
     * @return true if the IP is in the CIDR range, false otherwise
     */
    public static boolean isIpInCidrRange(String ip, String cidr) {
        try {
            String[] parts = cidr.split("/");
            if (parts.length != 2) {
                return false;
            }

            InetAddress networkAddress = InetAddress.getByName(parts[0]);
            int prefixLength = Integer.parseInt(parts[1]);

            InetAddress clientAddress = InetAddress.getByName(ip);

            byte[] networkBytes = networkAddress.getAddress();
            byte[] clientBytes = clientAddress.getAddress();

            // IPv4 and IPv6 addresses have different lengths
            if (networkBytes.length != clientBytes.length) {
                return false;
            }

            int fullBytes = prefixLength / 8;
            int remainingBits = prefixLength % 8;

            // Compare full bytes
            for (int i = 0; i < fullBytes; i++) {
                if (networkBytes[i] != clientBytes[i]) {
                    return false;
                }
            }

            // Compare remaining bits
            if (remainingBits > 0 && fullBytes < networkBytes.length) {
                int mask = (0xFF << (8 - remainingBits)) & 0xFF;
                return (networkBytes[fullBytes] & mask) == (clientBytes[fullBytes] & mask);
            }

            return true;
        } catch (UnknownHostException | NumberFormatException e) {
            return false;
        }
    }
}
