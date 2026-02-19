
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
          "subTitle": "(Food)",
          "filterType": "category",
          "filterValue": "Food",
          "limit": 10,
          "enabled": true,
          "order": 3,
          "type": "content_carousel"
        },
        {
          "id": "sec_1770482669748",
          "template": "featured_businesses",
          "dataSource": "restaurants",
          "title": "Featured Restaurants",
          "subTitle": "",
          "filterType": "isFeatured",
          "filterValue": "true",
          "limit": 10,
          "enabled": true,
          "order": 4,
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
        "targetId": "r-001",
        "targetType": "restaurant",
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
        "businessId": "r-001",
        "color": "#FEF2F2",
        "isSectionBanner": true,
        "linkType": "restaurants",
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
        "businessId": "r-002",
        "color": "#EFF6FF",
        "isSectionBanner": true,
        "linkType": "restaurants",
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
        "businessId": "r-002",
        "color": "#FFFBEB",
        "isHomeBanner": true,
        "linkType": "restaurants",
        "isActive": true
    }
  },
  news: {
    "news-seed-001": {
      "title": "CeyHallo Expands to New Markets",
      "excerpt": "Exciting news! CeyHallo is now available in Sri Lanka, bringing people together.",
      "content": "<p>Full article content about the expansion to Sri Lanka. This move is expected to connect thousands of new users.</p>",
      "imageUrl": "https://picsum.photos/seed/srilanka/400/250",
      "author": "CeyHallo Team",
      "publishedDate": "2024-10-20T14:00:00Z",
      "category": "Expansion",
      "isFeatured": true,
      "isPublished": true
    },
    "news-seed-002": {
      "title": "Annual Tech Conference Announced",
      "excerpt": "Join us for the biggest tech event of the year, with speakers from around the globe.",
      "content": "<p>The conference will cover topics ranging from AI to modern web development frameworks. Get your tickets now!</p>",
      "imageUrl": "https://picsum.photos/seed/techconf/400/250",
      "author": "Tech Events Inc.",
      "publishedDate": "2024-09-15T09:00:00Z",
      "category": "Technology",
      "isFeatured": true,
      "isPublished": true
    },
    "news-seed-003": {
      "title": "Community Clean-Up Drive",
      "excerpt": "Local residents gathered this weekend for a massive beach clean-up initiative.",
      "content": "<p>Over 500 volunteers participated in the event...</p>",
      "imageUrl": "https://picsum.photos/seed/cleanup/400/250",
      "author": "Green Earth",
      "publishedDate": "2024-09-10T09:00:00Z",
      "category": "Community",
      "isFeatured": false,
      "isPublished": true
    }
  },
  restaurants: {
    "r-001": {
      "title": "Colombo Bites",
      "description": "Authentic Sri Lankan short eats and cocktails.",
      "cuisine": "Short Eats",
      "location": "Al Nahda, Sharjah",
      "priceRange": "$$",
      "rating": 4.8,
      "reviews": 275,
      "imageUrl": "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Cocktails", "Snacks"],
      "isFeatured": true,
      "isVerified": true,
      "isPremium": true,
      "isPublished": true
    },
    "r-002": {
      "title": "Ceylonka Fine Dining",
      "description": "Experience the pinnacle of Sri Lankan culinary artistry in Dubai Marina. Ceylonka offers an exquisite menu that blends traditional flavors with modern gastronomic techniques, all set in a luxurious and elegant ambiance. Perfect for special occasions and discerning palates.",
      "cuisine": "Fine Dining",
      "location": "Pier 7, Dubai Marina, Dubai",
      "priceRange": "$$$",
      "rating": 4.9,
      "reviews": 450,
      "imageUrl": "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop",
      "tags": ["Luxury", "Seafood"],
      "isFeatured": true,
      "isVerified": true,
      "openingHours": [
        { "days": "Mon - Fri", "time": "6:00 PM - 12:00 AM" },
        { "days": "Sat - Sun", "time": "12:00 PM - 1:00 AM" }
      ],
      "gallery": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550966871-3ed3c47e2ce2?q=80&w=800&auto=format&fit=crop"
      ],
      "isPublished": true
    },
    "r-003": {
      "title": "Lanka Plate Street Food",
      "description": "Traditional street food favorites.",
      "cuisine": "Street Food",
      "location": "Al Karama, Dubai",
      "priceRange": "$",
      "rating": 4.7,
      "reviews": 180,
      "imageUrl": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Street Food", "Spicy"],
      "isFeatured": true,
      "isVerified": true,
      "isPublished": true
    },
    "r-004": {
      "title": "Abu Dhabi Hopper House",
      "description": "Famous for egg hoppers and string hoppers.",
      "cuisine": "Street Food",
      "location": "Khalidiya, Abu Dhabi",
      "priceRange": "$",
      "rating": 4.6,
      "reviews": 150,
      "imageUrl": "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Hoppers", "Breakfast"],
      "isFeatured": false,
      "isVerified": false,
      "isPublished": true
    },
    "r-005": {
      "title": "Kandy Express",
      "description": "Quick bites and kottu roti on the go.",
      "cuisine": "Short Eats",
      "location": "Deira, Dubai",
      "priceRange": "$",
      "rating": 4.2,
      "reviews": 210,
      "imageUrl": "https://images.unsplash.com/photo-1625398407796-b3a6cd6d8170?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Fast Food", "Kottu"],
      "isFeatured": false,
      "isVerified": false,
      "isPublished": true
    },
    "r-006": {
      "title": "The Cinnamon Room",
      "description": "Elegant dining with a focus on spices.",
      "cuisine": "Fine Dining",
      "location": "Corniche, Abu Dhabi",
      "priceRange": "$$$",
      "rating": 4.8,
      "reviews": 300,
      "imageUrl": "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Spices", "Dinner"],
      "isFeatured": true,
      "isVerified": true,
      "isPublished": true
    },
    "r-007": {
      "title": "RAK Kottu Station",
      "description": "The best cheese kottu in the northern emirates.",
      "cuisine": "Street Food",
      "location": "Al Nakheel, Ras Al Khaimah",
      "priceRange": "$",
      "rating": 4.5,
      "reviews": 88,
      "imageUrl": "https://images.unsplash.com/photo-1606471191009-63994c53433b?q=80&w=2574&auto=format&fit=crop",
      "tags": ["Kottu", "Cheese"],
      "isFeatured": false,
      "isVerified": false,
      "isPublished": true
    },
    "r-008": {
      "title": "Ajman Seafood Hut",
      "description": "Fresh catch of the day cooked Sri Lankan style.",
      "cuisine": "Seafood",
      "location": "Ajman Corniche, Ajman",
      "priceRange": "$$",
      "rating": 4.7,
      "reviews": 120,
      "imageUrl": "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?q=80&w=2670&auto=format&fit=crop",
      "tags": ["Seafood", "Fresh"],
      "isFeatured": false,
      "isVerified": true,
      "isPublished": true
    },
    "r-009": {
      "title": "Fujairah Flavours",
      "description": "All you can eat buffet weekends.",
      "cuisine": "Buffet",
      "location": "City Centre, Fujairah",
      "priceRange": "$$",
      "rating": 4.3,
      "reviews": 65,
      "imageUrl": "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2574&auto=format&fit=crop",
      "tags": ["Buffet", "Family"],
      "isFeatured": false,
      "isVerified": false,
      "isPublished": true
    },
    "r-010": {
      "title": "Sharjah Lamprais Corner",
      "description": "Authentic Dutch burgher lamprais wrapped in banana leaf.",
      "cuisine": "Fine Dining",
      "location": "Al Majaz, Sharjah",
      "priceRange": "$$",
      "rating": 4.9,
      "reviews": 190,
      "imageUrl": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=2581&auto=format&fit=crop",
      "tags": ["Lamprais", "Lunch"],
      "isFeatured": true,
      "isVerified": true,
      "isPublished": true
    },
    "r-011": {
      "title": "Mangrove Deck",
      "description": "Scenic views with delicious fusion cuisine.",
      "cuisine": "Fusion",
      "location": "Al Senyah, Umm Al Quwain",
      "priceRange": "$$",
      "rating": 4.4,
      "reviews": 56,
      "imageUrl": "https://images.unsplash.com/photo-1515669097368-22e6f156953c?q=80&w=2670&auto=format&fit=crop",
      "tags": ["View", "Outdoor"],
      "isFeatured": false,
      "isVerified": true,
      "isPublished": true
    },
    "r-012": {
      "title": "East Coast Grill",
      "description": "Best BBQ on the east coast.",
      "cuisine": "BBQ",
      "location": "Khor Fakkan, Sharjah",
      "priceRange": "$$",
      "rating": 4.6,
      "reviews": 134,
      "imageUrl": "https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?q=80&w=2670&auto=format&fit=crop",
      "tags": ["BBQ", "Family"],
      "isFeatured": true,
      "isVerified": true,
      "isPublished": true
    }
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
    "org-1": {
      "name": "Sri Lankan Welfare Association",
      "category": "Community",
      "location": "Bur Dubai, Dubai",
      "rating": 4.9,
      "reviewCount": 150,
      "imageUrl": "https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2674&auto=format&fit=crop",
      "isPromoted": true,
      "description": "Supporting the community through various welfare programs and events.",
      "phone": "+971 4 333 4444",
      "email": "info@slwa.ae",
      "website": "www.slwa.ae",
      "menuUrl": "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      "isPublished": true
    },
    "org-2": {
      "name": "Lanka Lions Sports Club",
      "category": "Sports",
      "location": "Sharjah",
      "rating": 4.7,
      "reviewCount": 85,
      "imageUrl": "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?q=80&w=2629&auto=format&fit=crop",
      "isPromoted": false,
      "description": "Promoting sportsmanship and athletic excellence among Sri Lankans in UAE.",
      "phone": "+971 6 555 6666",
      "email": "sports@lankalions.ae",
      "website": "www.lankalions.ae",
      "isPublished": true
    }
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
