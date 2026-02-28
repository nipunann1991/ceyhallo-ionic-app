
export const MOCK_DATA = {
  settings: {
    "app_config": {
      "showSocialLogin": false,
      "showAiBot": true,
      "homeSections": [
        {
          "id": "sec_1770482316511",
          "template": "banners",
          "dataSource": "banners",
          "title": "",
          "subTitle": "",
          "filterType": "all",
          "filterValue": "",
          "limit": 10,
          "enabled": true,
          "order": 1,
          "type": "content_carousel"
        },
        {
          "id": "sec_1770482465754",
          "template": "categories",
          "dataSource": "categories",
          "title": "",
          "subTitle": "",
          "filterType": "",
          "filterValue": "",
          "limit": 10,
          "enabled": true,
          "order": 2,
          "type": "category_grid"
        },
        {
          "id": "sec_1770482549463",
          "template": "latest_offers",
          "dataSource": "offers",
          "title": "Latest Offers",
          "subTitle": "",
          "filterType": "category",
          "filterValue": "Food",
          "limit": 10,
          "enabled": true,
          "order": 3,
          "type": "content_carousel"
        },
        {
          "id": "sec_1770481130640",
          "template": "latest_offers",
          "dataSource": "offers",
          "title": "Special Offers",
          "subTitle": "",
          "filterType": "category",
          "filterValue": "Business",
          "limit": 10,
          "enabled": true,
          "order": 5,
          "type": "content_carousel"
        },
        {
          "id": "sec_1770482837330",
          "template": "featured_businesses",
          "dataSource": "businesses",
          "title": "Featured Businesses",
          "subTitle": "",
          "filterType": "isFeatured",
          "filterValue": "true",
          "limit": 10,
          "enabled": true,
          "order": 6,
          "type": "content_carousel"
        },
        {
          "id": "sec_1770482395299",
          "template": "news_feed",
          "dataSource": "news",
          "title": "Latest News",
          "subTitle": "",
          "filterType": "",
          "filterValue": "",
          "limit": 10,
          "enabled": true,
          "order": 7,
          "type": "content_list"
        }
      ]
    }
  },
  countries: {
    "AE": {
        "name": "United Arab Emirates",
        "flagUrl": "https://firebasestorage.googleapis.com/v0/b/ceyhallo-89e40.appspot.com/o/flags%2Fae.png?alt=media&token=7c15115c-8923-442a-9e54-315e1454171e",
        "cities": [
            { "id": "dubai", "name": "Dubai" },
            { "id": "abu_dhabi", "name": "Abu Dhabi" },
            { "id": "sharjah", "name": "Sharjah" },
            { "id": "ajman", "name": "Ajman" },
            { "id": "ras_al_khaimah", "name": "Ras Al Khaimah" },
            { "id": "fujairah", "name": "Fujairah" },
            { "id": "umm_al_quwain", "name": "Umm Al Quwain" }
        ],
        "isActive": true
    },
    "LK": {
        "name": "Sri Lanka",
        "flagUrl": "https://firebasestorage.googleapis.com/v0/b/ceyhallo-89e40.appspot.com/o/flags%2Flk.png?alt=media&token=e7f8e537-19cd-49a3-8588-639939edf789",
        "cities": [
            { "id": "colombo", "name": "Colombo" },
            { "id": "kandy", "name": "Kandy" },
            { "id": "galle", "name": "Galle" }
        ],
        "isActive": true
    }
  },
  banners: {
    "b-1": {
        "category": "Highlight",
        "title": "Welcome to CeyHallo",
        "description": "Your community app for everything Sri Lankan in UAE.",
        "image": "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=2232&auto=format&fit=crop",
        "active": true,
        "order": 1
    },
    "b-2": {
        "category": "Event",
        "title": "Music Fest 2025",
        "description": "Get your tickets now for the biggest musical event.",
        "image": "https://images.unsplash.com/photo-1459749411177-d4a414c9ff86?q=80&w=2670&auto=format&fit=crop",
        "active": true,
        "targetId": "evt-1",
        "targetType": "event",
        "order": 2
    },
    "b-3": {
        "category": "Food",
        "title": "Taste of Lanka",
        "description": "Discover authentic flavors near you.",
        "image": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2670&auto=format&fit=crop",
        "active": true,
        "targetId": "biz-001",
        "targetType": "business",
        "navigationType": "internal",
        "order": 3
    }
  },
  users: {
    "MOVIjqGHEffplb52Fot4xnOl9Yr2": {
        "id": "MOVIjqGHEffplb52Fot4xnOl9Yr2",
        "email": "alex@ceyhallo.com",
        "name": "Alex Perera",
        "isVerified": false,
        "city": "Dubai",
        "region": "AE",
        "phoneNumber": "",
        "dateOfBirth": "",
        "address": "",
        "createdAt": "2026-01-11T19:33:51.497Z"
    }
  },
  notifications: {
    "notif-1": {
      "title": "Welcome to CeyHallo!",
      "message": "We are glad to have you here. Explore events, news, and businesses near you.",
      "date": "2024-10-28T09:00:00Z",
      "read": false,
      "type": "success"
    },
    "notif-2": {
      "title": "Event Reminder",
      "message": "The 'Community BBQ at the Park' is happening tomorrow. Don't forget to bring your tickets!",
      "date": "2024-10-27T18:30:00Z",
      "read": true,
      "type": "info",
      "link": "/events"
    },
    "notif-3": {
      "title": "Account Verification",
      "message": "Please verify your email address to access all features.",
      "date": "2024-10-25T10:00:00Z",
      "read": false,
      "type": "warning",
      "link": "/tabs/profile"
    },
    "notif-4": {
      "title": "New Job Posted",
      "message": "A new 'Senior Frontend Developer' role matches your profile.",
      "date": "2024-10-20T14:15:00Z",
      "read": true,
      "type": "info",
      "link": "/jobs"
    }
  },
  offers: {
    "off-1": {
        "title": "Weekend Special",
        "businessName": "Colombo Bites",
        "discount": "20% OFF",
        "description": "Get 20% off on all short eats this weekend.",
        "image": "https://images.unsplash.com/photo-1626804475297-411d0c1737e2?q=80&w=800&auto=format&fit=crop",
        "expiryDate": "2025-12-31T23:59:59Z",
        "businessId": "biz-001",
        "color": "#FEF2F2",
        "isSectionBanner": true,
        "linkType": "businesses",
        "isHomeBanner": true,
        "isActive": true
    },
    "off-1-b": {
        "title": "Seafood Night",
        "businessName": "Ceylonka",
        "discount": "30% OFF",
        "description": "Fresh catch prepared your way. Reserve now!",
        "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        "expiryDate": "2025-12-31T23:59:59Z",
        "businessId": "biz-002",
        "color": "#EFF6FF",
        "isSectionBanner": true,
        "linkType": "businesses",
        "isHomeBanner": false,
        "isActive": true
    },
    "off-2": {
        "title": "Deep Clean Promo",
        "businessName": "Sparkle Solutions",
        "discount": "AED 50 OFF",
        "description": "Save AED 50 on your first deep cleaning service.",
        "image": "https://images.unsplash.com/photo-1581578731117-104f2a412727?q=80&w=800&auto=format&fit=crop",
        "expiryDate": "2025-11-30T23:59:59Z",
        "businessId": "biz-001",
        "color": "#F0F9FF",
        "isSectionBanner": true,
        "linkType": "businesses",
        "isHomeBanner": true,
        "isActive": true
    },
    "off-2-b": {
        "title": "Global Shipping",
        "businessName": "Island Logistics",
        "discount": "15% OFF",
        "description": "Discount on sea freight to Sri Lanka.",
        "image": "https://images.unsplash.com/photo-1494412651409-ae1e3ad26160?q=80&w=2670&auto=format&fit=crop",
        "expiryDate": "2025-11-30T23:59:59Z",
        "businessId": "biz-002",
        "color": "#FFFBEB",
        "isSectionBanner": true,
        "linkType": "businesses",
        "isHomeBanner": false,
        "isActive": true
    },
    "off-3": {
        "title": "Family Feast",
        "businessName": "Ceylonka",
        "discount": "Buy 1 Get 1",
        "description": "Buy one main course and get another for free.",
        "image": "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        "expiryDate": "2025-10-15T23:59:59Z",
        "businessId": "biz-002",
        "color": "#FFFBEB",
        "isHomeBanner": true,
        "linkType": "businesses",
        "isActive": true
    }
  },
  news: {
  },
  businesses: {
    "biz-001": {
      "name": "Sparkle Solutions Cleaning",
      "category": "CLEANING SERVICES",
      "location": "Business Bay, Dubai",
      "rating": 4.8,
      "reviewCount": 124,
      "imageUrl": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=2670&auto=format&fit=crop",
      "isPromoted": true,
      "description": "Sparkle Solutions brings you premium residential and commercial cleaning services. Our team is fully trained, background-checked, and dedicated to making your space shine. We use eco-friendly products and state-of-the-art equipment.",
      "phone": "+971 50 123 4567",
      "email": "hello@sparklesolutions.ae",
      "website": "www.sparklesolutions.ae",
      "isPublished": true
    },
    "biz-002": {
      "name": "Island Logistics",
      "category": "SHIPPING",
      "location": "Jebel Ali, Dubai",
      "rating": 4.9,
      "reviewCount": 210,
      "imageUrl": "https://images.unsplash.com/photo-1494412651409-ae1e3ad26160?q=80&w=2670&auto=format&fit=crop",
      "isPromoted": true,
      "description": "Reliable and fast shipping solutions for all your logistics needs. We specialize in international freight forwarding, warehousing, and last-mile delivery. Your cargo is safe with us.",
      "phone": "+971 4 888 9999",
      "email": "support@islandlogistics.com",
      "website": "www.islandlogistics.com",
      "isPublished": true
    },
    "biz-1": {
        "title": "Super Cleaners",
        "category": "Cleaning",
        "location": "Business Bay, Dubai",
        "rating": 4.5,
        "reviews": 20,
        "countryCode": "AE",
        "cityCode": "DXB",
        "isVerified": true,
        "imageUrl": "https://picsum.photos/400/305",
        "description": "Super Cleaners is a top-rated cleaning service in Dubai. We offer deep cleaning, sofa cleaning, and carpet shampooing services at affordable rates. Satisfaction guaranteed.",
        "phone": "+971 55 987 6543",
        "email": "contact@supercleaners.ae",
        "website": "www.supercleaners.ae",
        "isPublished": true
     }
  },
  organizations: {
  },
  events: {
    "evt-1": {
        "title": "Community BBQ",
        "description": "Join us for a fun weekend BBQ with the community.",
        "content": "<p>Full details about the BBQ event.</p>",
        "imageUrl": "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=2670&auto=format&fit=crop",
        "date": "2024-11-15T16:00:00Z",
        "location": "Zabeel Park, Dubai",
        "category": "Social",
        "organizer": "Sri Lankan Welfare Association",
        "organizerId": "org-1",
        "isFeatured": true,
        "isPublished": true,
        "gallery": [
            "https://images.unsplash.com/photo-1555244162-803834f70033?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1529124781585-e35f5f43152c?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1533777324565-a040eb52facd?q=80&w=800&auto=format&fit=crop"
        ]
    },
    "evt-2": {
        "title": "Tech Talk: AI Future",
        "description": "Discussing the future of AI in business.",
        "content": "<p>Join industry leaders for a discussion on AI.</p>",
        "imageUrl": "https://images.unsplash.com/photo-1544531586-fde5298cdd40?q=80&w=2670&auto=format&fit=crop",
        "date": "2024-12-01T10:00:00Z",
        "location": "DIFC, Dubai",
        "category": "Technology",
        "organizer": "Tech UAE",
        "isFeatured": false,
        "isPublished": true
    }
  },
  jobs: {
    "job-1": {
        "title": "Senior Frontend Developer",
        "company": "Tech Solutions",
        "companyLogo": "https://ui-avatars.com/api/?name=TS&background=random",
        "location": "Dubai Internet City",
        "jobType": "Full-time",
        "salaryRange": "AED 15k - 20k",
        "postedDate": "2024-10-25T09:00:00Z",
        "isFeatured": true,
        "description": "<p>We are looking for an experienced Angular developer.</p>",
        "responsibilities": ["Develop UI components", "Optimize performance"],
        "qualifications": ["5+ years experience", "Expert in Angular"],
        "skills": ["Angular", "TypeScript", "Tailwind"],
        "isPublished": true
    },
    "job-2": {
        "title": "Marketing Manager",
        "company": "Brand Boost",
        "companyLogo": "https://ui-avatars.com/api/?name=BB&background=random",
        "location": "Business Bay, Dubai",
        "jobType": "Full-time",
        "postedDate": "2024-10-20T10:00:00Z",
        "isFeatured": false,
        "description": "<p>Lead our marketing team.</p>",
        "responsibilities": ["Manage campaigns", "Analyze data"],
        "qualifications": ["Marketing degree", "3 years experience"],
        "skills": ["SEO", "Social Media", "Analytics"],
        "isPublished": true
    }
  },
  legal: {
    "privacy": {
      "title": "Privacy Policy",
      "content": "<h2>1. Introduction</h2><p>Welcome to CeyHallo. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p><h2>2. Important Information and Who We Are</h2><h3>Controller</h3><p>CeyHallo is the controller and responsible for your personal data.</p><h3>Contact Details</h3><p>If you have any questions about this privacy policy or our privacy practices, please contact us at support@ceyhallo.com.</p><h2>3. The Data We Collect About You</h2><p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p><ul><li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li><li><strong>Contact Data:</strong> includes email address and telephone numbers.</li><li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access this website.</li><li><strong>Profile Data:</strong> includes your username and password, purchases or orders made by you, your interests, preferences, feedback and survey responses.</li><li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li></ul><h2>4. How We Use Your Personal Data</h2><p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p><ul><li>Where we need to perform the contract we are about to enter into or have entered into with you.</li><li>Where it is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.</li><li>Where we need to comply with a legal obligation.</li></ul><h2>5. Data Security</h2><p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors and other third parties who have a business need to know.</p><h2>6. Data Retention</h2><p>We will only retain your personal data for as long as reasonably necessary to fulfill the purposes we collected it for, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.</p>",
      "lastUpdated": "2024-10-26T00:00:00Z"
    },
    "terms": {
      "title": "Terms & Conditions",
      "content": "<h2>1. Agreement to Terms</h2><p>These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity (“you”) and CeyHallo (“we,” “us” or “our”), concerning your access to and use of the CeyHallo application as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the “Site”).</p><h2>2. Intellectual Property Rights</h2><p>Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the “Content”) and the trademarks, service marks, and logos contained therein (the “Marks”) are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws and various other intellectual property rights.</p><h2>3. User Representations</h2><p>By using the Site, you represent and warrant that:</p><ul><li>All registration information you submit will be true, accurate, current, and complete.</li><li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li><li>You have the legal capacity and you agree to comply with these Terms of Use.</li><li>You are not a minor in the jurisdiction in which you reside.</li><li>You will not access the Site through automated or non-human means, whether through a bot, script or otherwise.</li><li>You will not use the Site for any illegal or unauthorized purpose.</li></ul><h2>4. Prohibited Activities</h2><p>You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.</p><h2>5. User Generated Contributions</h2><p>The Site may invite you to chat, contribute to, or participate in blogs, message boards, online forums, and other functionality, and may provide you with the opportunity to create, submit, post, display, transmit, perform, publish, distribute, or broadcast content and materials to us or on the Site, including but not limited to text, writings, video, audio, photographs, graphics, comments, suggestions, or personal information or other material (collectively, \"Contributions\"). Contributions may be viewable by other users of the Site and the Marketplace and through third-party websites.</p><h2>6. Contribution License</h2><p>By posting your Contributions to any part of the Site, you automatically grant, and you represent and warrant that you have the right to grant, to us an unrestricted, unlimited, irrevocable, perpetual, non-exclusive, transferable, royalty-free, fully-paid, worldwide right, and license to host, use, copy, reproduce, disclose, sell, resell, publish, broadcast, retitle, archive, store, cache, publicly perform, publicly display, reformat, translate, transmit, excerpt (in whole or in part), and distribute such Contributions.</p><h2>7. Term and Termination</h2><p>These Terms of Use shall remain in full force and effect while you use the Site. WITHOUT LIMITING ANY OTHER PROVISION OF THESE TERMS OF USE, WE RESERVE THE RIGHT TO, IN OUR SOLE DISCRETION AND WITHOUT NOTICE OR LIABILITY, DENY ACCESS TO AND USE OF THE SITE (INCLUDING BLOCKING CERTAIN IP ADDRESSES), TO ANY PERSON FOR ANY REASON OR FOR NO REASON, INCLUDING WITHOUT LIMITATION FOR BREACH OF ANY REPRESENTATION, WARRANTY, OR COVENANT CONTAINED IN THESE TERMS OF USE OR OF ANY APPLICABLE LAW OR REGULATION.</p>",
      "lastUpdated": "2024-10-26T00:00:00Z"
    }
  },
  support: {
    "info": {
        "phone": "+971 4 123 4567",
        "email": "support@ceyhallo.com",
        "address": "Level 10, CeyHallo HQ, Business Bay, Dubai, UAE",
        "workingHours": "Mon - Fri, 9am - 6pm GST",
        "faqs": [
            { "id": "1", "question": "How do I reset my password?", "answer": "Go to Profile > Change Password to update your credentials. If you are logged out, use the 'Forgot Password?' link on the login screen." },
            { "id": "2", "question": "How can I verify my account?", "answer": "Check your email inbox for a verification link sent upon registration. If missed, you can resend it from your Profile page." },
            { "id": "3", "question": "Is the app free?", "answer": "Yes, CeyHallo is completely free to download and use for all community members." },
            { "id": "4", "question": "How do I contact a business?", "answer": "You can call or email businesses directly from their details page using the contact buttons at the bottom." },
            { "id": "5", "question": "Can I post my own events?", "answer": "Currently, event posting is limited to verified organizers. Please contact support if you wish to become an organizer." }
        ]
    }
  }
};
