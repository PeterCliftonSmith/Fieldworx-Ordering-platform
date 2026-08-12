export type Product = {
  id: string;
  name: string;
  unit: string;
  price: number;
  category: string;
};

export type Supplier = {
  id: string;
  name: string;
  region: string;
  specialty: string;
  leadTime: string;
  image: string;
  imageAlt: string;
  blurb: string;
  products: Product[];
};

export const suppliers: Supplier[] = [
  {
    id: "green-valley",
    name: "Green Valley Produce",
    region: "Stellenbosch",
    specialty: "Fresh vegetables & herbs",
    leadTime: "Next-day delivery",
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Crates of fresh market vegetables",
    blurb:
      "Farm-picked greens, roots, and kitchen herbs packed for restaurant volume.",
    products: [
      {
        id: "gv-tomato",
        name: "Roma tomatoes",
        unit: "kg",
        price: 28.5,
        category: "Vegetables",
      },
      {
        id: "gv-rocket",
        name: "Wild rocket",
        unit: "200g",
        price: 22,
        category: "Herbs & leaves",
      },
      {
        id: "gv-onion",
        name: "Brown onions",
        unit: "10kg bag",
        price: 95,
        category: "Vegetables",
      },
      {
        id: "gv-basil",
        name: "Fresh basil",
        unit: "bunch",
        price: 18,
        category: "Herbs & leaves",
      },
      {
        id: "gv-potato",
        name: "Medium potatoes",
        unit: "10kg bag",
        price: 110,
        category: "Vegetables",
      },
    ],
  },
  {
    id: "atlantic-catch",
    name: "Atlantic Catch Co.",
    region: "Hout Bay",
    specialty: "Day-boat seafood",
    leadTime: "Same-day cut-off 10:00",
    image:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Fresh fish displayed on ice",
    blurb:
      "Line-caught fish and shellfish portioned for a la carte and banquet service.",
    products: [
      {
        id: "ac-kingklip",
        name: "Kingklip fillets",
        unit: "kg",
        price: 245,
        category: "Fish",
      },
      {
        id: "ac-mussels",
        name: "Live mussels",
        unit: "kg",
        price: 68,
        category: "Shellfish",
      },
      {
        id: "ac-calamari",
        name: "Calamari tubes",
        unit: "kg",
        price: 165,
        category: "Shellfish",
      },
      {
        id: "ac-salmon",
        name: "Norwegian salmon",
        unit: "side",
        price: 520,
        category: "Fish",
      },
    ],
  },
  {
    id: "karoo-meats",
    name: "Karoo Pasture Meats",
    region: "Beaufort West",
    specialty: "Grass-fed beef & lamb",
    leadTime: "2-day delivery",
    image:
      "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Butcher preparing fresh meat cuts",
    blurb:
      "Traceable pasture meats cut to kitchen specs — from mince to aged steaks.",
    products: [
      {
        id: "km-rump",
        name: "Rump steak",
        unit: "kg",
        price: 189,
        category: "Beef",
      },
      {
        id: "km-lamb",
        name: "Lamb loin chops",
        unit: "kg",
        price: 265,
        category: "Lamb",
      },
      {
        id: "km-mince",
        name: "Lean beef mince",
        unit: "kg",
        price: 98,
        category: "Beef",
      },
      {
        id: "km-boerewors",
        name: "Traditional boerewors",
        unit: "kg",
        price: 115,
        category: "Sausage",
      },
    ],
  },
  {
    id: "pantry-house",
    name: "Pantry House Dry Goods",
    region: "Paarden Eiland",
    specialty: "Oils, grains & staples",
    leadTime: "Next-day delivery",
    image:
      "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=1600&q=80",
    imageAlt: "Bulk dry goods and pantry staples",
    blurb:
      "Kitchen staples in trade sizes — rice, oils, flours, and service-ready dry stock.",
    products: [
      {
        id: "ph-olive",
        name: "Extra virgin olive oil",
        unit: "5L",
        price: 420,
        category: "Oils",
      },
      {
        id: "ph-rice",
        name: "Basmati rice",
        unit: "10kg",
        price: 285,
        category: "Grains",
      },
      {
        id: "ph-flour",
        name: "Cake flour",
        unit: "12.5kg",
        price: 145,
        category: "Baking",
      },
      {
        id: "ph-salt",
        name: "Fine sea salt",
        unit: "5kg",
        price: 78,
        category: "Seasoning",
      },
    ],
  },
];

export function getSupplier(id: string): Supplier | undefined {
  return suppliers.find((s) => s.id === id);
}

export function getProduct(
  supplierId: string,
  productId: string,
): { supplier: Supplier; product: Product } | undefined {
  const supplier = getSupplier(supplierId);
  if (!supplier) return undefined;
  const product = supplier.products.find((p) => p.id === productId);
  if (!product) return undefined;
  return { supplier, product };
}
