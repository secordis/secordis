# Secordis - Public Alpha

This is what you've been looking for. A completely open-source and free content blocker, proxy detector, and exploit stopper. Made with the access and general rights of the students in mind.

Secordis is in MAJOR ALPHA. Documentation, official website, server software, none of that has been completed. However, Secordis Blocker, Secordis Security, and Secordis Authentication is all good to go with a little bit of manual configuration and going through code. Which is obviously not good at all. The code is now public. Once all features are done, the entire monorepo will be updates frequently, instead of changes being pushed to the (private) Secordis repo where it is being constantly developed.

For now, we recommend not using this. If you do, you'll have to go through the config.json files, add new CRX certificated and replace the developer ones, etc. All of this will be handled in the coming Secordis Admin server, where you can easily build and host Secordis.

## Features

- Dynamic Proxy Sniffer: looks for popular proxies using different proxy technologies. Proxy mirrors become useless, no matter the domain.
- [Integrations with existing blockers, without needing to actually use those "insecure/bloated" extensions](#integrations)
- Bypass resistant

## Bypass Detection

- If the blocker extension, or the Secordis Security extension goes down, you can lockdown the session.
- Resistant to different attacks like DNS poisoning through Omada, LTMEAT, DPS, issues abused in Insecurly/Cookie Dough, issued abused in SWAMP, etc.
- Very little user input, hard to XSS, and impossible to XSS the Security extension which has the only abusable special permission `management`.

**This is why it is extremely recommended to integrate Secordis with other blockers, instead of installing the other blocker extensions. We avoid possible abusable permissions which only matters if other possibly less secure blocker extensions aren't installed, which can be abused.**

Secordis's official recommendation, if you plan on using another blocker alongside Secordis's proxy detection, is Lightspeed Filter Agent. It has not had a single Lightspeed specific issue which would lead to blocker evasion, but it is still vulnerable to things that Secordis isn't (such as LTMEAT).

## Integrations

We offer certain integration with other blocklists for free. Furthermore, there are paid blocklists that you can buy; we do not control any of these blocklists, as they are from third parties.

> If a blocklist requires a license, you can configure Secordis with Secordis Admin (panel) with the corresponding license.

Integrations:

- Lightspeed (free, uses Lightspeed's archive API)
- Blocksi domain API (free, uses official API) [COMING SOON]
- Securly (paid/free) [IMPLEMENTING LATER]

Major notice: although Secordis' current caching system helps with this issue a lot, adding an integration will noticibly add a delay as their corresponding systems need to be requested. If Secordis is used for proxy prevention only, URLs are stored locally and does not add too much overhead.

## Defaults

Proxies are blocked by default. Secordis' main function is proxy blocking; integrations exist to make Secordis a complete content blocker. If integrations are enabled, porn websites are also blocked by default. More info in the documentation.

## Documentation

psst: this documentation does not exist yet, as Secordis is still in Public Alpha. 

- [Setup/hosting documentation for enterprise](setup.md).
- [Contribute](contribute.md)

Secordis is open source for a reason! We appreciate pull requests to further optimize Secordis.

## Credits/Licensing

Thank you, contributers.

D-ENT-XR: Initial Release
Byte: Security Hardening, other aspects of Secordis