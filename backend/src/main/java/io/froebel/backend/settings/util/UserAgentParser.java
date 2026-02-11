package io.froebel.backend.settings.util;

import org.springframework.stereotype.Component;
import ua_parser.Client;
import ua_parser.Parser;

@Component
public class UserAgentParser {

    private final Parser parser;

    public UserAgentParser() {
        this.parser = new Parser();
    }

    public ParsedUserAgent parse(String userAgentString) {
        if (userAgentString == null || userAgentString.isBlank()) {
            return new ParsedUserAgent("Unknown", "Unknown", "Unknown Device");
        }

        try {
            Client client = parser.parse(userAgentString);

            String browser = formatBrowser(client);
            String os = formatOS(client);
            String deviceName = formatDevice(client, os, browser);

            return new ParsedUserAgent(browser, os, deviceName);
        } catch (Exception e) {
            return new ParsedUserAgent("Unknown", "Unknown", "Unknown Device");
        }
    }

    private String formatBrowser(Client client) {
        if (client.userAgent == null || client.userAgent.family == null) {
            return "Unknown";
        }

        String family = client.userAgent.family;
        String major = client.userAgent.major;

        if (major != null && !major.isBlank()) {
            return family + " " + major;
        }
        return family;
    }

    private String formatOS(Client client) {
        if (client.os == null || client.os.family == null) {
            return "Unknown";
        }

        String family = client.os.family;
        String major = client.os.major;

        if (major != null && !major.isBlank()) {
            return family + " " + major;
        }
        return family;
    }

    private String formatDevice(Client client, String os, String browser) {
        if (client.device != null && client.device.family != null
            && !client.device.family.equals("Other")) {
            return client.device.family;
        }

        // Fallback: create a descriptive device name from OS and browser
        return browser + " on " + os;
    }

    public record ParsedUserAgent(
        String browser,
        String os,
        String deviceName
    ) {}
}
