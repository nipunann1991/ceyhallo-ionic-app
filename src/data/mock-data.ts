





export const MOCK_DATA = {
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
      "isPremium": true
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
      ]
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
      "isVerified": true
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
      "isVerified": false
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
      "isVerified": false
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
      "isVerified": true
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
      "isVerified": false
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
      "isVerified": true
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
      "isVerified": false
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
      "isVerified": true
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
      "isVerified": true
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
      "isVerified": true
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
      "website": "www.sparklesolutions.ae"
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
      "website": "www.islandlogistics.com"
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
        "website": "www.supercleaners.ae"
     }
  },
  banners: {
    "banner-001": {
      "category": "COMMUNITY",
      "title": "Uniting Sri Lankans",
      "description": "CeyHallo proudly brings together Sri Lankans living across the UAE and Qatar...",
      "image": "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?q=80&w=2613&auto=format&fit=crop",
      "active": true
    },
    "banner-002": {
      "category": "EVENTS",
      "title": "Dubai Expo City Return",
      "description": "Experience the magic again as Expo City opens its doors for the winter season.",
      "image": "https://images.unsplash.com/photo-1546412414-e1885259563a?q=80&w=2574&auto=format&fit=crop",
      "active": true
    }
  },
  countries: {
    "AE": {
      "name": "United Arab Emirates",
      "flagUrl": "https://flagcdn.com/w80/ae.png",
      "cities": [
        { "code": "DXB", "name": "Dubai" },
        { "code": "AUH", "name": "Abu Dhabi" },
        { "code": "SHJ", "name": "Sharjah" },
        { "code": "AJM", "name": "Ajman" },
        { "code": "UAQ", "name": "Umm Al Quwain" },
        { "code": "RAK", "name": "Ras Al Khaimah" },
        { "code": "FUJ", "name": "Fujairah" }
      ]
    },
    "QA": {
      "name": "Qatar",
      "flagUrl": "https://flagcdn.com/w80/qa.png",
      "cities": [
        { "code": "DOH", "name": "Doha" },
        { "code": "RAY", "name": "Al Rayyan" }
      ]
    },
    "LK": {
      "name": "Sri Lanka",
      "flagUrl": "https://flagcdn.com/w80/lk.png",
      "cities": [
        { "code": "CMB", "name": "Colombo" },
        { "code": "KCY", "name": "Kandy" }
      ]
    }
  },
  categories: {
    "cat-0": {
      "id": "cat-0",
      "label": "News",
      "icon": "https://cdn-icons-png.flaticon.com/512/2965/2965879.png",
      "tab": "news",
      "order": 0,
      "hasNotification": true
    },
    "cat-1": {
      "id": "cat-1",
      "label": "Jobs",
      "icon": "https://cdn-icons-png.flaticon.com/512/942/942748.png",
      "tab": "jobs",
      "order": 1,
      "hasNotification": false
    },
    "cat-2": {
      "id": "cat-2",
      "label": "Restaurants",
      "icon": "https://picsum.photos/51",
      "tab": "restaurants",
      "order": 2,
      "hasNotification": false
    },
    "cat-3": {
      "id": "cat-3",
      "label": "Businesses",
      "icon": "https://cdn-icons-png.flaticon.com/512/3201/3201479.png",
      "tab": "businesses",
      "order": 3,
      "hasNotification": false
    },
    "cat-4": {
      "id": "cat-4",
      "label": "Events",
      "icon": "https://cdn-icons-png.flaticon.com/512/2602/2602414.png",
      "tab": "events",
      "order": 4,
      "hasNotification": true
    }
  },
  events: {
    "event-seed-001": {
      "title": "Community BBQ at the Park",
      "description": "Join us for a fun-filled day with food, music, and games at Zabeel Park. A great chance to meet new people!",
      "fullDate": "25 December 2024",
      "startTime": "12:00",
      "endTime": "18:00",
      "allDayEvent": false,
      "location": "Zabeel Park, Gate 4, Dubai",
      "imageUrl": "https://images.unsplash.com/photo-1504754524776-8f4f37790774?q=80&w=2670&auto=format&fit=crop",
      "organizer": "CeyHallo Community",
      "category": "Social",
      "isFeatured": true,
      "isPublished": true,
      "countryCode": "AE",
      "cityCode": "DXB",
      "publishedDate": "2024-10-01T10:00:00Z",
      "createdDate": "2024-09-28T10:00:00Z"
    },
    "event-seed-002": {
      "title": "Business Networking Gala",
      "description": "Connect with professionals and entrepreneurs from the Sri Lankan community in the UAE. Keynote speakers and dinner.",
      "fullDate": "30 November 2024",
      "startTime": "19:30",
      "endTime": "23:00",
      "allDayEvent": false,
      "location": "Armani Hotel, Burj Khalifa, Dubai",
      "imageUrl": "https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=2670&auto=format&fit=crop",
      "organizer": "SL Business Council",
      "category": "Business",
      "isFeatured": true,
      "isPublished": true,
      "countryCode": "AE",
      "cityCode": "DXB",
      "publishedDate": "2024-10-15T10:00:00Z",
      "createdDate": "2024-10-12T10:00:00Z"
    },
    "event-seed-003": {
      "title": "Community Sports Day",
      "description": "A fun-filled day of sports and activities for the whole family. Cricket, volleyball, and more!",
      "fullDate": "07 December 2024",
      "startTime": "09:00",
      "endTime": "17:00",
      "allDayEvent": false,
      "location": "Sharjah Cricket Stadium, Sharjah",
      "imageUrl": "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2570&auto=format&fit=crop",
      "organizer": "Community Group",
      "category": "Sports",
      "isFeatured": false,
      "isPublished": true,
      "countryCode": "AE",
      "cityCode": "SHJ",
      "publishedDate": "2024-10-20T10:00:00Z",
      "createdDate": "2024-10-18T10:00:00Z"
    }
  },
  jobs: {
    "job-1": {
      "title": "Senior Frontend Developer",
      "company": "Innovate Solutions Inc.",
      "companyLogo": "https://cdn.dribbble.com/users/1061323/screenshots/11186120/media/f95157b8561c28c6e088562a1b5518a4.png?compress=1&resize=400x300",
      "location": "Dubai, UAE",
      "jobType": "Full-time",
      "salaryRange": "AED 15,000 - 20,000 / month",
      "postedDate": "2025-10-28T00:00:00Z",
      "isFeatured": true,
      "description": "We are seeking a highly skilled Senior Frontend Developer to join our dynamic team in Dubai. The ideal candidate will have extensive experience with React, TypeScript, and modern frontend build pipelines. You will be responsible for developing and maintaining high-quality web applications, collaborating with cross-functional teams to define, design, and ship new features.",
      "responsibilities": [
        "Develop new user-facing features using React.js",
        "Build reusable components and front-end libraries for future use",
        "Translate designs and wireframes into high-quality code",
        "Optimize components for maximum performance across a vast array of web-capable devices and browsers"
      ],
      "qualifications": [
        "5+ years of professional experience in frontend development.",
        "Strong proficiency in JavaScript, including DOM manipulation and the JavaScript object model.",
        "Thorough understanding of React.js and its core principles.",
        "Experience with popular React.js workflows (such as Flux or Redux).",
        "Familiarity with RESTful APIs."
      ],
      "skills": ["React", "TypeScript", "Redux", "Webpack", "CSS-in-JS", "Jest"],
      "countryCode": "AE",
      "cityCode": "DXB"
    },
    "job-2": {
      "title": "Digital Marketing Manager",
      "company": "Creative Hub",
      "companyLogo": "https://cdn.dribbble.com/users/1615584/screenshots/14015462/media/4c6a6a49191054b02341235157158376.jpg?compress=1&resize=400x300",
      "location": "Abu Dhabi, UAE",
      "jobType": "Full-time",
      "salaryRange": "AED 12,000 - 16,000 / month",
      "postedDate": "2025-10-25T00:00:00Z",
      "isFeatured": false,
      "description": "Creative Hub is looking for an experienced Digital Marketing Manager to develop, implement, track and optimize our digital marketing campaigns across all digital channels.",
      "responsibilities": [
        "Plan and execute all digital marketing, including SEO/SEM, marketing database, email, social media and display advertising campaigns",
        "Measure and report performance of all digital marketing campaigns",
        "Identify trends and insights, and optimize spend and performance based on the insights"
      ],
      "qualifications": [
        "BS/MS degree in marketing or a related field",
        "Proven working experience in digital marketing",
        "Demonstrable experience leading and managing SEO/SEM, marketing database, email, social media and/or display advertising campaigns"
      ],
      "skills": ["SEO", "SEM", "Google Analytics", "Social Media Marketing", "Content Marketing"],
      "countryCode": "AE",
      "cityCode": "AUH"
    },
    "job-3": {
      "title": "UI/UX Designer",
      "company": "Pixel Perfect Designs",
      "companyLogo": "https://cdn.dribbble.com/users/385418/screenshots/11192511/media/07f4a2185295b75b85558197931327c6.png?compress=1&resize=400x300",
      "location": "Sharjah, UAE",
      "jobType": "Part-time",
      "salaryRange": "AED 8,000 - 10,000 / month",
      "postedDate": "2025-10-22T00:00:00Z",
      "isFeatured": false,
      "description": "We are looking for a talented UI/UX Designer to create amazing user experiences. The ideal candidate should have an eye for clean and artful design, possess superior UI skills and be able to translate high-level requirements into interaction flows and artifacts, and transform them into beautiful, intuitive, and functional user interfaces.",
      "responsibilities": [
        "Collaborate with product management and engineering to define and implement innovative solutions for the product direction, visuals and experience",
        "Execute all visual design stages from concept to final hand-off to engineering",
        "Create wireframes, storyboards, user flows, process flows and site maps to effectively communicate interaction and design ideas"
      ],
      "qualifications": [
        "Proven UI experience with a strong portfolio",
        "Solid experience in creating wireframes, storyboards, user flows, process flows and site maps",
        "Proficiency in Figma, Sketch, Photoshop, Illustrator, or other visual design and wire-framing tools"
      ],
      "skills": ["Figma", "Sketch", "Adobe XD", "Prototyping", "User Research"],
      "countryCode": "AE",
      "cityCode": "SHJ"
    }
  },
  legal: {
    "privacy": {
      "title": "Privacy Policy",
      "content": "<h2>1. Introduction</h2><p>Welcome to CeyHallo. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our app.</p><h2>2. Information We Collect</h2><p>We collect information that you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include your name, email address, and profile picture.</p><h2>3. How We Use Your Information</h2><p>We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect CeyHallo and our users.</p><h2>4. Contact Us</h2><p>If you have any questions about this Privacy Policy, please contact us at support@ceyhallo.com.</p>",
      "lastUpdated": "2024-10-01T00:00:00Z"
    },
    "terms": {
      "title": "Terms & Conditions",
      "content": "<h2>1. Acceptance of Terms</h2><p>By accessing or using the CeyHallo app, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use the app.</p><h2>2. User Accounts</h2><p>You are responsible for safeguarding your account information and for any activity that occurs under your account. You agree to notify us immediately of any unauthorized use.</p><h2>3. Prohibited Conduct</h2><p>You agree not to use the app for any illegal or unauthorized purpose, including but not limited to violating intellectual property rights or transmitting harmful code.</p><h2>4. Termination</h2><p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms.</p>",
      "lastUpdated": "2024-10-01T00:00:00Z"
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