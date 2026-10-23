window.MINI_BABY = {
  currency: "د.أ",
  whatsappNumber: "962788477005",
  business: {
    name: "ميني بيبي _ MINI BABY",
    address: "عمّان، الأردن",
    description: "متجر متخصص بتجهيزات البيبي ومستلزماته وإكسسواراته وملابس الأطفال من حديثي الولادة حتى عمر 3 سنوات، مع بضاعة راقية وخدمة عملاء وتعامل راقٍ.",
    phone: "+962 7 8847 7005",
    instagram: "https://www.instagram.com/mini_baby_jo/",
    facebook: "https://www.facebook.com/profile.php?id=100093203524711",
    rating: "5.0 / 5",
    hours: [
      { day: "السبت – الخميس", time: "11:00 صباحًا – 11:00 مساءً" },
      { day: "الجمعة", time: "1:00 ظهرًا – 11:00 مساءً" }
    ],
    reviews: [
      "محل راقي وبضاعة جميلة، والموظفات على قدر عالي من الذوق والأخلاق.",
      "كل شي بلزم البيبي متوفر بالمحل و تعامل راقي و بضاعه و لا احلى من هيك.",
      "أسعار جيدة جداً وأماكن رائعة."
    ]
  },
  categories: [
    { id: "all", label: "كل القطع" },
    { id: "clothes", label: "ملابس" },
    { id: "essentials", label: "مستلزمات بيبي" },
    { id: "accessories", label: "إكسسوارات" }
  ],
  products: [
    {
      id: "winter-wool-set-grey",
      name: "طقم بيبي شتوي صوف",
      category: "clothes",
      description: "طقم شتوي من الصوف: بلوزة بأزرار مع بنطلون.",
      sizes: ["1", "2", "3", "4"],
      sizeNote: "المقاس 4 مناسب لعمر سنة.",
      price: 7,
      color: "#dedbd2",
      colorName: "سكني",
      colors: [
        {
          name: "أحمر",
          hex: "#671a2e",
          mannequin: "assets/products/preview/wool-red.jpg",
          photos: ["assets/products/winter-wool-set-red.jpg"]
        },
        {
          name: "سكني",
          hex: "#b9bcbc",
          mannequin: "assets/products/preview/wool-grey.jpg",
          photos: [
            "assets/products/winter-wool-set-grey-front.jpg",
            "assets/products/winter-wool-set-grey-back.jpg",
            "assets/products/winter-wool-set-knit-detail.jpg",
            "assets/products/winter-wool-set-cuff-detail.jpg"
          ]
        },
        {
          name: "أسود",
          hex: "#353438",
          mannequin: "assets/products/preview/wool-black.jpg",
          photos: ["assets/products/winter-wool-set-black.jpg"]
        },
        {
          name: "بيج",
          hex: "#d5bd98",
          mannequin: "assets/products/preview/wool-beige.jpg",
          photos: []
        }
      ],
      outfit: "winter-knit-set",
      image: "assets/products/winter-wool-set-grey-front.jpg",
      gallery: ["assets/products/winter-wool-set-grey-detail.jpg"]
    },
    {
      id: "girls-red-rose-dress",
      name: "فستان أحمر بوردات سوداء",
      category: "clothes",
      description: "فستان أحمر بدون أكمام، مزين بوردة سوداء على الصدر ووردات أسفل التنورة مع شريط أسود.",
      sizes: ["1", "2", "3", "4"],
      price: 10,
      color: "#a51932",
      image: "assets/products/girls-red-rose-dress/product.jpg",
      mannequin: "assets/products/preview/red-rose-dress.jpg",
      gallery: ["assets/products/girls-red-rose-dress/detail.jpg"]
    },
    {
      id: "girls-yellow-navy-dress",
      name: "فستان أميرة أصفر وكحلي",
      category: "clothes",
      description: "فستان أصفر وكحلي بنقشة ورود ذهبية وأكمام منفوشة وكشكش، وتظهر معه حقيبة وربطة شعر وحذاء.",
      sizes: ["1", "2", "3", "4"],
      price: 10,
      color: "#e1bd39",
      image: "assets/products/girls-yellow-navy-dress/product.jpg",
      mannequin: "assets/products/preview/yellow-navy-dress.jpg",
      gallery: ["assets/products/girls-yellow-navy-dress/detail.jpg"]
    },
    {
      id: "girls-red-navy-dress",
      name: "فستان أحمر وكحلي مزين بالورد",
      category: "clothes",
      description: "فستان بدون أكمام باللونين الأحمر والكحلي، مع فيونكة وورود قماشية وتفاصيل حمراء على التنورة.",
      sizes: ["1", "2", "3", "4"],
      price: 10,
      color: "#8e2139",
      image: "assets/products/girls-red-navy-dress/product.jpg",
      mannequin: "assets/products/preview/red-navy-dress.jpg",
      gallery: ["assets/products/girls-red-navy-dress/detail.jpg"]
    },
    {
      id: "girls-purple-floral-dress",
      name: "فستان بنفسجي بنقشة زهور",
      category: "clothes",
      description: "فستان بنفسجي بأكمام مكشكشة، مزين بفيونكة أمامية وشريط دانتيل ونقشة زهور بيضاء وبنفسجية.",
      sizes: ["1", "2", "3", "4"],
      price: 10,
      color: "#9b6bd1",
      image: "assets/products/girls-purple-floral-dress/product.jpg",
      mannequin: "assets/products/preview/purple-floral-dress.jpg",
      gallery: ["assets/products/girls-purple-floral-dress/detail.jpg"]
    },
    {
      id: "girls-denim-yellow-dress",
      name: "فستان جينز بكشكش أصفر",
      category: "clothes",
      description: "فستان جينز بدون أكمام، مزين بشريط زهور بيضاء وصفراء وتنورة بكشكش كاروهات أصفر.",
      sizes: ["1", "2", "3", "4"],
      price: 10,
      color: "#87a8c5",
      image: "assets/products/girls-denim-yellow-dress/product.jpg",
      mannequin: "assets/products/preview/denim-yellow-dress.jpg",
      gallery: ["assets/products/girls-denim-yellow-dress/detail.jpg"]
    }
  ]
};
