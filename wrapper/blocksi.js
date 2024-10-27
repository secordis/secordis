async function getBlocksiCategory(site) { // not yet implemented
    const policies = {
        100: "Malicious content",
        101: "Phishing & Fraud",
        102: "Web SPAM",
        103: "Newly Registered Domain",
        104: "Newly Observed Domain",
        105: "Dynamic DNS",
        200: "Drug Abuse",
        201: "Hacking",
        202: "Illegal or Unethical",
        203: "Discrimination",
        204: "Explicit Violence",
        205: "Extremist Groups",
        206: "Proxy Avoidance",
        207: "Plagiarism",
        208: "Child Abuse",
        300: "Alternative Beliefs",
        301: "Abortion",
        302: "Other Adult Materials",
        303: "Advocacy Organizations",
        304: "Gambling",
        305: "Nudity and Risque",
        306: "Pornography",
        307: "Dating",
        308: "Weapons (Sales)",
        309: "Marijuana",
        310: "Sex Education",
        311: "Alcohol",
        312: "Tobacco",
        313: "Lingerie and Swimsuit",
        314: "Sports Hunting and War Games",
        400: "Freeware and Software",
        401: "File Sharing and Storage",
        402: "Streaming Media and Download",
        403: "Peer-to-peer File Sharing",
        404: "Internet Radio and TV",
        405: "Internet Telephony",
        500: "Finance and Banking",
        501: "Search Engine and Portals",
        502: "General Organizations",
        503: "Business",
        504: "Information and Computer Security",
        505: "Government and Legal Organizations",
        506: "Information Technology",
        507: "Armed Forces",
        508: "Web Hosting",
        509: "Secure Websites",
        510: "Web-based Applications",
        511: "Online Meeting",
        512: "Remote Access",
        513: "Web Analytics",
        514: "Charitable Organizations",
        600: "Advertising",
        601: "Brokerage and Trading",
        602: "Games",
        603: "Web-based Email",
        604: "Entertainment",
        605: "Art/Culture",
        606: "Education",
        607: "Health and Wellness",
        608: "Job Search",
        609: "Medicine",
        610: "News and Media",
        611: "Social Networking",
        612: "Political Organizations",
        613: "Reference",
        614: "Global Religion",
        615: "Shopping",
        616: "Society and Lifestyle",
        617: "Sports",
        618: "Travel",
        619: "Personal Vehicles",
        620: "Dynamic Content",
        621: "Meaningless Content",
        622: "Folklore",
        623: "Web Chat",
        624: "Instant Messaging",
        625: "Newsgroups and Message Boards",
        626: "Digital Postcards",
        627: "Child Education",
        628: "Real Estate",
        629: "Restaurant and Dining",
        630: "Personal Websites and Blogs",
        631: "Content Servers",
        632: "Domain Parking",
        633: "Personal Privacy",
        700: "Unrated"
    };
    
        return fetch(`https://service1.blocksi.net/getRating.json?url=${site}`)
        .then(data => data.json())
        .then(data => {
            let cat = data.Category
            if (cat == 100 || cat == 101 || cat == 102 || cat == 201) {
                return "security/malware"
            }
            if (cat == 306 || cat == 302 || cat == 313 || cat == 305 || cat == 307 || cat == 310) {
                return "porn"
            }
    
            if (cat == 200 || cat == 309 || cat == 311 || cat == 312) {
                return "drugs"
            }
    
            if (cat == 202 || cat == 203 || cat == 204 || cat == 205) {
                return "illegal"
            }
    
            if (cat == 206) {
                return "proxy"
            }
    
            if (cat == 304) {
                return "gambling"
            }        
    
            if (cat == 308) {
                return "weapons"
            }    
    
            if (cat == 624) {
                return "messaging"
            }    
    
            if (cat == 600) {
                return "messaging"
            }    
    
            if (cat == 602) {
                return "games"
            }    
    
            if (cat == 604 || cat == 402) {
                return "entertainment"
            }
    
            
            return "none"
        })
    }