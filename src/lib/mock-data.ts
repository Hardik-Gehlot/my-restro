import { Category, Dish, Restaurant, User } from "@/types";

export const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Pizza',
    restaurantId: 'pizza_paradise_123'
  },
  {
    id: 'cat-2',
    name: 'Pasta',
    restaurantId: 'pizza_paradise_123'
  },
  {
    id: 'cat-3',
    name: 'Desserts',
    restaurantId: 'pizza_paradise_123'
  },
  {
    id: 'cat-4',
    name: 'Beverages',
    restaurantId: 'pizza_paradise_123'
  },
  {
    id: 'cat-5',
    name: 'Starters',
    restaurantId: 'pizza_paradise_123'
  },
  {
    id: 'cat-5',
    name: 'Seafood',
    restaurantId: 'burger_hub_789'
  },
  {
    id: 'cat-6',
    name: 'Pasta',
    restaurantId: 'burger_hub_789'
  }
];

export const mockRestaurants: Restaurant[] = [
  {
    id: "pizza_paradise_123",
    name: "Pizza Paradise",
    tagline: "Authentic Italian Pizzas & Pasta",
    mobile_no: "+91-9876543210",
    logo: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop",
    cover_image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&h=400&fit=crop",
    google_map_link: "https://maps.google.com/?q=Pizza+Paradise+Mumbai",
    google_rating_link: "https://g.page/r/CZ_rBKUCHEbzEBM/review",
    about_us: "empty",
    instagram_link: "https://www.instagram.com/pizzaparadise",
    facebook_link: "https://www.facebook.com/pizzaparadise",
    twitter_link: "https://twitter.com/pizzaparadise",
    linkedin_link: "",
    youtube_link: "",
    active_plan: "menu",
    plan_expiry: "2027-01-21"
  },
  {
    id: "spice_route_456",
    name: "Spice Route",
    tagline: "Royal Indian Cuisine",
    mobile_no: "+91-9123456789",
    logo: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200&fit=crop",
    cover_image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&h=400&fit=crop",
    google_map_link: "https://maps.google.com/?q=Spice+Route+Bangalore",
    google_rating_link: "https://g.page/r/CZ_rBKUCHEbzEBM/review",
    about_us: "empty",
    instagram_link: "https://www.instagram.com/spiceroute",
    facebook_link: "https://www.facebook.com/spiceroute",
    twitter_link: "",
    linkedin_link: "",
    youtube_link: "",
    active_plan: "order",
    plan_expiry: "2027-01-21"
  },
  {
    id: "burger_hub_789",
    name: "Burger Hub",
    tagline: "Gourmet Burgers & Shakes",
    mobile_no: "+91-9988776655",
    logo: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop",
    cover_image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&h=400&fit=crop",
    google_map_link: "https://maps.google.com/?q=Burger+Hub+Delhi",
    google_rating_link: "https://g.page/r/CZ_rBKUCHEbzEBM/review",
    about_us: "empty",
    instagram_link: "",
    facebook_link: "",
    twitter_link: "https://twitter.com/burgerhub",
    linkedin_link: "",
    youtube_link: "",
    active_plan: "grow",
    plan_expiry: "2027-01-21"
  },
];

export const mockDishes: Dish[] = [
  {
    id: "dish_001",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Margherita Pizza",
    image:
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop",
    category: "Pizza",
    description:
      "Classic Italian pizza with San Marzano tomatoes, fresh mozzarella, basil leaves, and extra virgin olive oil on a wood-fired crust.",
    isAvailable: true,
    variations: [
      { size: "small", price: 249 },
      { size: "medium", price: 349 },
      { size: "large", price: 449 },
    ],
  },
  {
    id: "dish_002",
    restaurantId: "pizza_paradise_123",
    isVeg: false,
    name: "Pepperoni Feast",
    image:
      "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop",
    category: "Pizza",
    description:
      "Loaded with premium pepperoni slices, mozzarella cheese, oregano, and our signature pizza sauce.",
    isAvailable: true,
    variations: [
      { size: "small", price: 299 },
      { size: "medium", price: 449 },
      { size: "large", price: 549 },
    ],
  },
  {
    id: "dish_003",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Pasta Alfredo",
    image:
      "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop",
    category: "Pasta",
    description:
      "Creamy fettuccine pasta tossed in rich Alfredo sauce with parmesan cheese and Italian herbs.",
    isAvailable: true,
    variations: [
      { size: "half", price: 199 },
      { size: "full", price: 329 },
    ],
  },
  {
    id: "dish_023",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Garlic Bread",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.zugnBMjoapkoTeeXBtOfTgHaHa%3Fpid%3DApi&f=1&ipt=e9c4759547cc6fa1f73a7eaab7a6d229ed48defcc937a3275b04063d66622eed&ipo=images",
    category: "Starters",
    description: "Toasted bread with garlic, butter, and herbs.",
    isAvailable: true,
    variations: [
      { size: "full", price: 149 },
    ],
  },
  {
    id: "dish_024",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Bruschetta",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.56QN47F0wfCsj02D6TrB5gHaLI%3Fpid%3DApi&f=1&ipt=9a81f61f553a99282be3d013336fb6c50d316628b5438f571a8bfc25dae2d1ff&ipo=images",
    category: "Starters",
    description: "Grilled bread topped with fresh tomatoes, garlic, basil, and olive oil.",
    isAvailable: true,
    variations: [
      { size: "full", price: 179 },
    ],
  },
  {
    id: "dish_025",
    restaurantId: "pizza_paradise_123",
    isVeg: false,
    name: "Chicken Wings",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%2Fid%2FOIP.Zun97KETf-DQXz6QHlgPLwHaJQ%3Fpid%3DApi&f=1&ipt=a85c70c1d1e9293824c4cd209192974b560be5a38d2e1636d22ccf2c5e3c0cfb&ipo=images",
    category: "Starters",
    description: "Spicy chicken wings tossed in BBQ sauce.",
    isAvailable: true,
    variations: [
      { size: "half", price: 229 },
      { size: "full", price: 399 },
    ],
  },
  {
    id: "dish_026",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Tiramisu",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.afkJmGx3I-7jhD8skzwX7gHaHa%3Fpid%3DApi&f=1&ipt=af7387da00d15933ae2e0404ee2a855e579609a6fc868757c139236e2b2b2432&ipo=images",
    category: "Desserts",
    description: "Classic Italian dessert with layers of coffee-soaked ladyfingers and mascarpone cheese.",
    isAvailable: true,
    variations: [
      { size: "full", price: 249 },
    ],
  },
  {
    id: "dish_027",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Panna Cotta",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.K5hoQ1fGr_gPR6RXdRU9CQHaE8%3Fpid%3DApi&f=1&ipt=5b35bc5e900fbcf3de98205fce85c97257b5ba394f11968483922783105ac99c&ipo=images",
    category: "Desserts",
    description: "Creamy Italian dessert with a caramel topping.",
    isAvailable: false,
    variations: [
      { size: "full", price: 199 },
    ],
  },
  {
    id: "dish_028",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Virgin Mojito",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.rZSRYjUuhkqfNpURMBwuUwHaJ3%3Fpid%3DApi&f=1&ipt=181ddf8cc32fc50a0128981d4fa4b001a8e94fb5c2316cecb00c7d691fcf8ef1&ipo=images",
    category: "Beverages",
    description: "A refreshing drink with mint, lime, and soda.",
    isAvailable: true,
    variations: [
      { size: "full", price: 149 },
    ],
  },
  {
    id: "dish_029",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Iced Tea",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.9UnCwliuBu5MvuliPpuGHQHaIy%3Fpid%3DApi&f=1&ipt=9dd921ad57de5766eb3fbf69bf3758ce08770020c7cca14ba5afb232aebaa2d4&ipo=images",
    category: "Beverages",
    description: "Chilled tea with a hint of lemon.",
    isAvailable: true,
    variations: [
      { size: "full", price: 129 },
    ],
  },
  {
    id: "dish_030",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Veggie Supreme Pizza",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%2Fid%2FOIP.MQMM4f3jXsZf_9HDvPhqXgHaGo%3Fpid%3DApi&f=1&ipt=e43dd9aa6c1882f05992710efe8dd896ca735c6dbb1208911d9eccddc4226421&ipo=images",
    category: "Pizza",
    description: "A pizza loaded with all your favorite veggies.",
    isAvailable: true,
    variations: [
      { size: "small", price: 299 },
      { size: "medium", price: 449 },
      { size: "large", price: 549 },
    ],
  },
  {
    id: "dish_031",
    restaurantId: "pizza_paradise_123",
    isVeg: false,
    name: "Chicken Alfredo Pasta",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.dL5xpgsXtle4oNoVW0JpzAHaJQ%3Fpid%3DApi&f=1&ipt=66c98c742d332656ba5cfc71d1a1530bec7827bc2b57b41c244ddab9c8072ecd&ipo=images",
    category: "Pasta",
    description: "Creamy fettuccine pasta with grilled chicken.",
    isAvailable: true,
    variations: [
      { size: "half", price: 249 },
      { size: "full", price: 429 },
    ],
  },
  {
    id: "dish_032",
    restaurantId: "pizza_paradise_123",
    isVeg: true,
    name: "Chocolate Lava Cake",
    image: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%2Fid%2FOIP.poUqyp3SvzoREQZ1ByAs0AHaHa%3Fcb%3Ddefcachec2%26pid%3DApi&f=1&ipt=5552bdd977d77f6125fd9f16ec3eda73fee8e05190db30a2551a20c189482f76&ipo=images",
    category: "Desserts",
    description: "Warm chocolate cake with a gooey molten center.",
    isAvailable: true,
    variations: [
      { size: "full", price: 179 },
    ],
  },
  // ========================================
  // SPICE ROUTE - 3 Dishes
  // ========================================
  {
    id: "dish_004",
    restaurantId: "spice_route_456",
    isVeg: false,
    name: "Butter Chicken",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&h=400&fit=crop",
    category: "Main Course",
    description:
      "Tender chicken pieces cooked in a creamy tomato gravy with butter, cream, and aromatic spices. A North Indian classic.",
    isAvailable: true,
    variations: [
      { size: "half", price: 299 },
      { size: "full", price: 479 },
    ],
  },
  {
    id: "dish_005",
    restaurantId: "spice_route_456",
    isVeg: true,
    name: "Paneer Tikka Masala",
    image:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&h=400&fit=crop",
    category: "Main Course",
    description:
      "Grilled cottage cheese cubes in a rich, spiced tomato-onion gravy with bell peppers and aromatic Indian spices.",
    isAvailable: true,
    variations: [
      { size: "half", price: 249 },
      { size: "full", price: 399 },
    ],
  },
  {
    id: "dish_006",
    restaurantId: "spice_route_456",
    isVeg: false,
    name: "Biryani Hyderabadi",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop",
    category: "Rice",
    description:
      "Fragrant basmati rice layered with marinated chicken, saffron, fried onions, and traditional Hyderabadi spices. Served with raita.",
    isAvailable: false,
    variations: [
      { size: "half", price: 249 },
      { size: "full", price: 429 },
    ],
  },

  // ========================================
  // BURGER HUB - 15+ Dishes
  // ========================================
  {
    id: "dish_007",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Classic Beef Burger",
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop",
    category: "Burgers",
    description:
      "Juicy beef patty with lettuce, tomato, onions, pickles, cheese, and our special sauce in a toasted sesame bun.",
    isAvailable: true,
    variations: [
      { size: "small", price: 179 },
      { size: "medium", price: 249 },
      { size: "large", price: 329 },
    ],
  },
  {
    id: "dish_008",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Veggie Delight Burger",
    image:
      "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&h=400&fit=crop",
    category: "Burgers",
    description:
      "Crispy vegetable patty with fresh lettuce, tomatoes, grilled onions, cheese, and mayo in a whole wheat bun.",
    isAvailable: true,
    variations: [
      { size: "small", price: 149 },
      { size: "medium", price: 199 },
      { size: "large", price: 269 },
    ],
  },
  {
    id: "dish_009",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Spicy Chicken Burger",
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600&h=400&fit=crop",
    category: "Burgers",
    description:
      "Crispy fried chicken breast with spicy mayo, jalapeños, lettuce, and cheese in a brioche bun.",
    isAvailable: true,
    variations: [
      { size: "small", price: 169 },
      { size: "medium", price: 229 },
      { size: "large", price: 299 },
    ],
  },
  {
    id: "dish_010",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "BBQ Bacon Burger",
    image:
      "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop",
    category: "Burgers",
    description:
      "Beef patty topped with crispy bacon, BBQ sauce, cheddar cheese, onion rings, and coleslaw.",
    isAvailable: true,
    variations: [
      { size: "medium", price: 279 },
      { size: "large", price: 369 },
    ],
  },
  {
    id: "dish_011",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Paneer Tikka Burger",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop",
    category: "Burgers",
    description:
      "Grilled paneer tikka patty with mint chutney, onions, tomatoes, and lettuce in a tandoori bun.",
    isAvailable: false,
    variations: [
      { size: "small", price: 159 },
      { size: "medium", price: 219 },
      { size: "large", price: 289 },
    ],
  },
  {
    id: "dish_012",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "French Fries",
    image:
      "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=600&h=400&fit=crop",
    category: "Sides",
    description:
      "Crispy golden french fries seasoned with salt and herbs. Perfect side for your burger!",
    isAvailable: true,
    variations: [
      { size: "small", price: 79 },
      { size: "medium", price: 99 },
      { size: "large", price: 129 },
    ],
  },
  {
    id: "dish_013",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Loaded Cheese Fries",
    image:
      "https://images.unsplash.com/photo-1630431341973-02e1b1c46993?w=600&h=400&fit=crop",
    category: "Sides",
    description:
      "Crispy fries loaded with melted cheese sauce, jalapeños, and spring onions.",
    isAvailable: true,
    variations: [
      { size: "medium", price: 149 },
      { size: "large", price: 199 },
    ],
  },
  {
    id: "dish_014",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Chicken Wings",
    image:
      "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop",
    category: "Sides",
    description:
      "Crispy fried chicken wings tossed in your choice of BBQ, Buffalo, or Peri-Peri sauce.",
    isAvailable: true,
    variations: [
      { size: "small", price: 179 },
      { size: "medium", price: 249 },
      { size: "large", price: 329 },
    ],
  },
  {
    id: "dish_015",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Onion Rings",
    image:
      "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&h=400&fit=crop",
    category: "Sides",
    description: "Crispy battered onion rings served with tangy dipping sauce.",
    isAvailable: true,
    variations: [
      { size: "small", price: 99 },
      { size: "medium", price: 139 },
    ],
  },
  {
    id: "dish_016",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Chocolate Shake",
    image:
      "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&h=400&fit=crop",
    category: "Beverages",
    description:
      "Thick and creamy chocolate milkshake topped with whipped cream and chocolate syrup.",
    isAvailable: true,
    variations: [
      { size: "small", price: 119 },
      { size: "medium", price: 149 },
      { size: "large", price: 189 },
    ],
  },
  {
    id: "dish_017",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Strawberry Shake",
    image:
      "https://images.unsplash.com/photo-1553530979-7ee52a2670c4?w=600&h=400&fit=crop",
    category: "Beverages",
    description:
      "Fresh strawberry milkshake blended with vanilla ice cream and topped with whipped cream.",
    isAvailable: true,
    variations: [
      { size: "small", price: 129 },
      { size: "medium", price: 159 },
      { size: "large", price: 199 },
    ],
  },
  {
    id: "dish_018",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Mango Smoothie",
    image:
      "https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=600&h=400&fit=crop",
    category: "Beverages",
    description:
      "Refreshing mango smoothie made with fresh mangoes, yogurt, and a touch of honey.",
    isAvailable: true,
    variations: [
      { size: "small", price: 119 },
      { size: "medium", price: 149 },
    ],
  },
  {
    id: "dish_019",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Caesar Salad",
    image:
      "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600&h=400&fit=crop",
    category: "Salads",
    description:
      "Fresh romaine lettuce, croutons, parmesan cheese, and Caesar dressing.",
    isAvailable: true,
    variations: [
      { size: "small", price: 149 },
      { size: "large", price: 229 },
    ],
  },
  {
    id: "dish_020",
    restaurantId: "burger_hub_789",
    isVeg: false,
    name: "Grilled Chicken Salad",
    image:
      "https://images.unsplash.com/photo-1604909052743-94e838986d24?w=600&h=400&fit=crop",
    category: "Salads",
    description:
      "Mixed greens with grilled chicken breast, cherry tomatoes, cucumber, and balsamic vinaigrette.",
    isAvailable: true,
    variations: [
      { size: "small", price: 199 },
      { size: "large", price: 279 },
    ],
  },
  {
    id: "dish_021",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Cheese Nachos",
    image:
      "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&h=400&fit=crop",
    category: "Appetizers",
    description:
      "Crispy tortilla chips topped with melted cheese, jalapeños, salsa, and sour cream.",
    isAvailable: true,
    variations: [
      { size: "small", price: 159 },
      { size: "medium", price: 219 },
      { size: "large", price: 289 },
    ],
  },
  {
    id: "dish_022",
    restaurantId: "burger_hub_789",
    isVeg: true,
    name: "Brownie Sundae",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&h=400&fit=crop",
    category: "Desserts",
    description:
      "Warm chocolate brownie topped with vanilla ice cream, chocolate sauce, and nuts.",
    isAvailable: false,
    variations: [
      { size: "small", price: 129 },
      { size: "large", price: 189 },
    ],
  },
];

export const mockUsers: User[] = [
  {
    id: "admin_001",
    email: "pizzaparadise@admin.com",
    password: "$2b$10$dGq18bgdY46i0S0JYWnksOwA18vWtmb2Xj8ejXxiDIEL2x6z8CaGG", // admin123
    restaurantId: "pizza_paradise_123",
    name: "Pizza Paradise Admin",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "admin_002",
    email: "spice@admin.com",
    password: "$2b$10$dGq18bgdY46i0S0JYWnksOwA18vWtmb2Xj8ejXxiDIEL2x6z8CaGG", //admin123
    restaurantId: "spice_route_456",
    name: "Spice Route Admin",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "admin_003",
    email: "burgehub@admin.com",
    password: "$2b$10$dGq18bgdY46i0S0JYWnksOwA18vWtmb2Xj8ejXxiDIEL2x6z8CaGG", //admin123
    restaurantId: "burger_hub_789",
    name: "Burger Hub Admin",
    role: "admin",
    createdAt: "2024-01-01T00:00:00Z",
  },
];
