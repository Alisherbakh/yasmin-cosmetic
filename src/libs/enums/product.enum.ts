export enum ProductSkinType {
    ALL = "ALL",                   // Barcha turdagi teriga
    DRY = "DRY",                   // Quruq teri
    OILY = "OILY",                 // Yog'li teri
    COMBINATION = "COMBINATION",   // Aralash teri
    SENSITIVE = "SENSITIVE",       // Nozik / Ta'sirchan teri
}

export enum ProductVolume {
    ML_30 = "30ml",                // Krem / Serum / Tonal
    ML_50 = "50ml",                // Yuz kremi
    ML_100 = "100ml",              // Tonik / Atir
    ML_200 = "200ml",              // Shampun / Loshon
    ML_500 = "500ml",              // Katta dush gel
    GRAM_10 = "10g",               // Pomada / Pudra / Ten
}

export enum ProductStatus {
    PAUSE= "PAUSE",
    PROCESS = "PROCESS",
    DELETE = "DELETE",
}

export enum ProductCollection {
    SKINCARE = "SKINCARE",         // Yuz parvarishi
    MAKEUP = "MAKEUP",             // Makiyaj
    HAIR_CARE = "HAIR_CARE",       // Soch parvarishi
    BODY_CARE = "BODY_CARE",       // Beden parvarishi
    FRAGRANCE = "FRAGRANCE",       // Atirlar
    GIFTS = "GIFTS",               // To'plamlar
    OTHER = "OTHER",
}