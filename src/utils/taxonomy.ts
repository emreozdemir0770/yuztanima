export interface BioTaxonomy {
  commonNameTR: string
  commonNameEN: string
  binomial?: string
  genus?: string
  family: string
  familyTR: string
  order: string
  orderTR: string
  class: string
  classTR: string
  phylum: string
  kingdom: string
  emoji: string
  description: string
  color: string
}

// Class color coding
const C = {
  mammal: '#00ff9d',
  bird: '#00d4ff',
  reptile: '#ffcc00',
  amphibian: '#ff6b35',
  fish: '#7b2fff',
  insect: '#ff3366',
  arachnid: '#ff9d00',
  human: '#00d4ff',
  other: '#94a3b8',
}

const TAXONOMY_DB: BioTaxonomy[] = [
  // ── HUMAN ──────────────────────────────────────────────────────────
  {
    commonNameTR: 'İnsan', commonNameEN: 'Human',
    binomial: 'Homo sapiens', genus: 'Homo',
    family: 'Hominidae', familyTR: 'Büyük Maymunlar',
    order: 'Primates', orderTR: 'Primatlar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🧑', color: C.human,
    description: 'Homo cinsinin günümüzde yaşayan tek türü. Yaklaşık 300.000 yıl önce Afrika\'da evrimleşmiştir.',
  },

  // ── CANIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'Evcil Köpek', commonNameEN: 'Domestic Dog',
    binomial: 'Canis lupus familiaris', genus: 'Canis',
    family: 'Canidae', familyTR: 'Köpekgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐕', color: C.mammal,
    description: 'Kurt\'tan evcilleştirilmiş, yaklaşık 15.000 yıl önce insanlarla ortak yaşama geçmiş memeli.',
  },
  {
    commonNameTR: 'Kurt', commonNameEN: 'Wolf',
    binomial: 'Canis lupus', genus: 'Canis',
    family: 'Canidae', familyTR: 'Köpekgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐺', color: C.mammal,
    description: 'Kuzey yarımkürede geniş alanlarda yaşayan, sürü halinde avlanan büyük köpekgil.',
  },
  {
    commonNameTR: 'Tilki', commonNameEN: 'Fox',
    binomial: 'Vulpes vulpes', genus: 'Vulpes',
    family: 'Canidae', familyTR: 'Köpekgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦊', color: C.mammal,
    description: 'Kırmızı tilki, en geniş coğrafi yayılışa sahip etçil memeli türlerinden biridir.',
  },

  // ── FELIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'Evcil Kedi', commonNameEN: 'Domestic Cat',
    binomial: 'Felis catus', genus: 'Felis',
    family: 'Felidae', familyTR: 'Kediler',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐈', color: C.mammal,
    description: 'Yaklaşık 10.000 yıl önce Yakın Doğu\'da Afrika vahşi kedisinden evcilleştirilmiştir.',
  },
  {
    commonNameTR: 'Aslan', commonNameEN: 'Lion',
    binomial: 'Panthera leo', genus: 'Panthera',
    family: 'Felidae', familyTR: 'Kediler',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦁', color: C.mammal,
    description: 'Savanada sürü halinde yaşayan, "ormanların kralı" olarak bilinen büyük kedigil.',
  },
  {
    commonNameTR: 'Kaplan', commonNameEN: 'Tiger',
    binomial: 'Panthera tigris', genus: 'Panthera',
    family: 'Felidae', familyTR: 'Kediler',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐯', color: C.mammal,
    description: 'Dünyanın en büyük kedigil türü. Asya ormanlarında yalnız yaşayan güçlü avcı.',
  },
  {
    commonNameTR: 'Leopar', commonNameEN: 'Leopard',
    binomial: 'Panthera pardus', genus: 'Panthera',
    family: 'Felidae', familyTR: 'Kediler',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐆', color: C.mammal,
    description: 'Benekli deseni ile tanınan, Afrika ve Asya\'da yaygın büyük kedigil.',
  },
  {
    commonNameTR: 'Çita', commonNameEN: 'Cheetah',
    binomial: 'Acinonyx jubatus', genus: 'Acinonyx',
    family: 'Felidae', familyTR: 'Kediler',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐆', color: C.mammal,
    description: 'Saatte 120 km hıza ulaşabilen, dünyanın en hızlı kara hayvanı.',
  },

  // ── URSIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'Ayı', commonNameEN: 'Bear',
    genus: 'Ursus',
    family: 'Ursidae', familyTR: 'Ayıgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐻', color: C.mammal,
    description: 'Büyük, güçlü memeliler. Kuzey yarımküre ve Güney Amerika\'da yaygındır.',
  },
  {
    commonNameTR: 'Kutup Ayısı', commonNameEN: 'Polar Bear',
    binomial: 'Ursus maritimus', genus: 'Ursus',
    family: 'Ursidae', familyTR: 'Ayıgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐻‍❄️', color: C.mammal,
    description: 'Arktik bölgesinde yaşayan, dünyanın en büyük kara etçili.',
  },

  // ── EQUIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'At', commonNameEN: 'Horse',
    binomial: 'Equus caballus', genus: 'Equus',
    family: 'Equidae', familyTR: 'Atgiller',
    order: 'Perissodactyla', orderTR: 'Tek Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐎', color: C.mammal,
    description: 'Yaklaşık 6.000 yıl önce evcilleştirilmiş, insanlık tarihine yön veren tek toynaklı.',
  },
  {
    commonNameTR: 'Zebra', commonNameEN: 'Zebra',
    genus: 'Equus',
    family: 'Equidae', familyTR: 'Atgiller',
    order: 'Perissodactyla', orderTR: 'Tek Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦓', color: C.mammal,
    description: 'Afrika savanasında yaşayan, siyah-beyaz çizgili desenleriyle tanınan tek toynaklı.',
  },

  // ── BOVIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'Sığır', commonNameEN: 'Cattle',
    binomial: 'Bos taurus', genus: 'Bos',
    family: 'Bovidae', familyTR: 'Boynuzlugiller',
    order: 'Artiodactyla', orderTR: 'Çift Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐄', color: C.mammal,
    description: '10.000 yıl önce Anadolu\'da evcilleştirilmiş, insanlığın temel besin kaynağı.',
  },
  {
    commonNameTR: 'Koyun', commonNameEN: 'Sheep',
    binomial: 'Ovis aries', genus: 'Ovis',
    family: 'Bovidae', familyTR: 'Boynuzlugiller',
    order: 'Artiodactyla', orderTR: 'Çift Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐑', color: C.mammal,
    description: 'En eski evcil hayvanlardan biri. Yünü ve sütü için yetiştirilir.',
  },

  // ── ELEPHANTIDAE ──────────────────────────────────────────────────
  {
    commonNameTR: 'Afrika Fili', commonNameEN: 'African Elephant',
    binomial: 'Loxodonta africana', genus: 'Loxodonta',
    family: 'Elephantidae', familyTR: 'Filler',
    order: 'Proboscidea', orderTR: 'Hortumlusular',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐘', color: C.mammal,
    description: 'Kara üzerinde yaşayan en büyük hayvan. Sosyal hafızası ve zekasıyla ünlü.',
  },
  {
    commonNameTR: 'Asya Fili', commonNameEN: 'Asian Elephant',
    binomial: 'Elephas maximus', genus: 'Elephas',
    family: 'Elephantidae', familyTR: 'Filler',
    order: 'Proboscidea', orderTR: 'Hortumlusular',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐘', color: C.mammal,
    description: 'Afrika filine göre daha küçük. Asya\'da evcilleştirilmiş ve çalışma hayvanı olarak kullanılmıştır.',
  },

  // ── GIRAFFIDAE ────────────────────────────────────────────────────
  {
    commonNameTR: 'Zürafa', commonNameEN: 'Giraffe',
    binomial: 'Giraffa camelopardalis', genus: 'Giraffa',
    family: 'Giraffidae', familyTR: 'Zürafagiller',
    order: 'Artiodactyla', orderTR: 'Çift Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦒', color: C.mammal,
    description: 'Dünyanın en uzun boylu kara hayvanı. Afrika savanasında yaşar.',
  },

  // ── PRIMATES (non-human) ──────────────────────────────────────────
  {
    commonNameTR: 'Şempanze', commonNameEN: 'Chimpanzee',
    binomial: 'Pan troglodytes', genus: 'Pan',
    family: 'Hominidae', familyTR: 'Büyük Maymunlar',
    order: 'Primates', orderTR: 'Primatlar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐒', color: C.mammal,
    description: 'İnsanın en yakın akrabası. DNA\'nın yaklaşık %98.7\'si insanla ortaktır.',
  },
  {
    commonNameTR: 'Goril', commonNameEN: 'Gorilla',
    genus: 'Gorilla',
    family: 'Hominidae', familyTR: 'Büyük Maymunlar',
    order: 'Primates', orderTR: 'Primatlar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦍', color: C.mammal,
    description: 'Dünyanın en büyük yaşayan primatı. Afrika ormanlarında yaşar.',
  },
  {
    commonNameTR: 'Maymun', commonNameEN: 'Monkey',
    family: 'Cercopithecidae', familyTR: 'Eski Dünya Maymunları',
    order: 'Primates', orderTR: 'Primatlar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐒', color: C.mammal,
    description: 'Primatlar takımının çeşitli ailelerine ait sosyal memeliler.',
  },

  // ── CETACEA ───────────────────────────────────────────────────────
  {
    commonNameTR: 'Yunus', commonNameEN: 'Dolphin',
    genus: 'Delphinus',
    family: 'Delphinidae', familyTR: 'Delfinler',
    order: 'Cetacea', orderTR: 'Balinalar ve Yunuslar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐬', color: C.mammal,
    description: 'Yüksek zekaları, sosyal yapıları ve ekolokaston yetenekleriyle tanınan deniz memelisi.',
  },

  // ── PANDA ─────────────────────────────────────────────────────────
  {
    commonNameTR: 'Dev Panda', commonNameEN: 'Giant Panda',
    binomial: 'Ailuropoda melanoleuca', genus: 'Ailuropoda',
    family: 'Ursidae', familyTR: 'Ayıgiller',
    order: 'Carnivora', orderTR: 'Etçiller',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐼', color: C.mammal,
    description: 'Çin\'e özgü nesli tehlike altındaki simge tür. Beslenmesinin %99\'u bambudan oluşur.',
  },

  // ── LEPORIDAE ─────────────────────────────────────────────────────
  {
    commonNameTR: 'Tavşan', commonNameEN: 'Rabbit',
    genus: 'Oryctolagus',
    family: 'Leporidae', familyTR: 'Tavşangiller',
    order: 'Lagomorpha', orderTR: 'Tavşanımsılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐰', color: C.mammal,
    description: 'Uzun kulakları ve güçlü arka bacaklarıyla tanınan, hızlı üreyen küçük memeli.',
  },

  // ── BIRDS ─────────────────────────────────────────────────────────
  {
    commonNameTR: 'Kartal', commonNameEN: 'Eagle',
    family: 'Accipitridae', familyTR: 'Atmacagiller',
    order: 'Accipitriformes', orderTR: 'Kartalımsılar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦅', color: C.bird,
    description: 'Güçlü pençeleri ve keskin görüşüyle tanınan, geniş açık alanlarda av yapan yırtıcı kuş.',
  },
  {
    commonNameTR: 'Baykuş', commonNameEN: 'Owl',
    family: 'Strigidae', familyTR: 'Baykuşgiller',
    order: 'Strigiformes', orderTR: 'Baykuşlar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦉', color: C.bird,
    description: 'Gece aktif, sessiz uçuş ve mükemmel işitme yeteneklerine sahip yırtıcı kuş.',
  },
  {
    commonNameTR: 'Papağan', commonNameEN: 'Parrot',
    family: 'Psittacidae', familyTR: 'Papağangiller',
    order: 'Psittaciformes', orderTR: 'Papağanlar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦜', color: C.bird,
    description: 'Tropikal ve subtropikal bölgelerde yaşayan, ses taklit yeteneğiyle ünlü zeki kuş.',
  },
  {
    commonNameTR: 'Penguen', commonNameEN: 'Penguin',
    family: 'Spheniscidae', familyTR: 'Penguengiller',
    order: 'Sphenisciformes', orderTR: 'Penguenler',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐧', color: C.bird,
    description: 'Uçamayan, yüzme konusunda uzmanlaşmış güney yarımküreye özgü kuş ailesi.',
  },
  {
    commonNameTR: 'Flamingo', commonNameEN: 'Flamingo',
    family: 'Phoenicopteridae', familyTR: 'Flamingogiller',
    order: 'Phoenicopteriformes', orderTR: 'Flamingolar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦩', color: C.bird,
    description: 'Pembe renkleri karotenoit pigmentlerinden kaynaklanır. Sığ sularda toplu yaşar.',
  },
  {
    commonNameTR: 'Tavus Kuşu', commonNameEN: 'Peacock',
    binomial: 'Pavo cristatus', genus: 'Pavo',
    family: 'Phasianidae', familyTR: 'Sülüngiller',
    order: 'Galliformes', orderTR: 'Tavuklar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦚', color: C.bird,
    description: 'Erkeklerin göz alıcı kuyruğu cinsel seçilim açısından ikonik bir örnektir.',
  },
  {
    commonNameTR: 'Serçe / Ötücü Kuş', commonNameEN: 'Songbird',
    family: 'Fringillidae', familyTR: 'İspinozgiller',
    order: 'Passeriformes', orderTR: 'Serçemsiler',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐦', color: C.bird,
    description: 'Tüm kuş türlerinin yaklaşık %60\'ını oluşturan en büyük kuş takımı.',
  },
  {
    commonNameTR: 'Karga / Kuzgun', commonNameEN: 'Crow / Raven',
    genus: 'Corvus',
    family: 'Corvidae', familyTR: 'Kargagiller',
    order: 'Passeriformes', orderTR: 'Serçemsiler',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐦‍⬛', color: C.bird,
    description: 'Problem çözme ve alet kullanabilme yetenekleriyle kuşlar arasında en zeki türler.',
  },
  {
    commonNameTR: 'Pelikan', commonNameEN: 'Pelican',
    family: 'Pelecanidae', familyTR: 'Pelikanlar',
    order: 'Pelecaniformes', orderTR: 'Pelikanlar',
    class: 'Aves', classTR: 'Kuşlar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐦', color: C.bird,
    description: 'Büyük kese benzeri gırtlağıyla balık yakalayan su kuşu.',
  },

  // ── REPTILIA ──────────────────────────────────────────────────────
  {
    commonNameTR: 'Timsah', commonNameEN: 'Crocodile',
    family: 'Crocodylidae', familyTR: 'Timsahgiller',
    order: 'Crocodilia', orderTR: 'Timsahlar',
    class: 'Reptilia', classTR: 'Sürüngenler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐊', color: C.reptile,
    description: '250 milyon yıllık evrimsel geçmişiyle "yaşayan fosil" olarak bilinir.',
  },
  {
    commonNameTR: 'Kaplumbağa', commonNameEN: 'Tortoise / Turtle',
    family: 'Testudinidae', familyTR: 'Kaplumbağagiller',
    order: 'Testudines', orderTR: 'Kaplumbağalar',
    class: 'Reptilia', classTR: 'Sürüngenler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐢', color: C.reptile,
    description: '300 milyon yılı aşan geçmişleriyle en eski sürüngen gruplarından biri.',
  },
  {
    commonNameTR: 'Yılan', commonNameEN: 'Snake',
    family: 'Colubridae', familyTR: 'Yılangiller',
    order: 'Squamata', orderTR: 'Pullu Sürüngenler',
    class: 'Reptilia', classTR: 'Sürüngenler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐍', color: C.reptile,
    description: 'Ekstremitesiz sürüngenler. Dünyanın neredeyse her habitatında 3700\'den fazla tür.',
  },
  {
    commonNameTR: 'Kertenkele', commonNameEN: 'Lizard',
    family: 'Lacertidae', familyTR: 'Gerçek Kertenkeleler',
    order: 'Squamata', orderTR: 'Pullu Sürüngenler',
    class: 'Reptilia', classTR: 'Sürüngenler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦎', color: C.reptile,
    description: 'Dünyanın en çeşitli sürüngen grubu; 6.000\'den fazla türü var.',
  },
  {
    commonNameTR: 'Iguana', commonNameEN: 'Iguana',
    binomial: 'Iguana iguana', genus: 'Iguana',
    family: 'Iguanidae', familyTR: 'İguanagiller',
    order: 'Squamata', orderTR: 'Pullu Sürüngenler',
    class: 'Reptilia', classTR: 'Sürüngenler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦎', color: C.reptile,
    description: 'Orta ve Güney Amerika\'ya özgü, bitkisel beslenen büyük kertenkele türü.',
  },

  // ── AMPHIBIA ──────────────────────────────────────────────────────
  {
    commonNameTR: 'Kurbağa', commonNameEN: 'Frog',
    family: 'Ranidae', familyTR: 'Gerçek Kurbağalar',
    order: 'Anura', orderTR: 'Kuyruksuz Kurbağalar',
    class: 'Amphibia', classTR: 'İkiyaşamlılar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐸', color: C.amphibian,
    description: 'Hem karada hem suda yaşayan, ekosistemin sağlık göstergesi sayılan canlılar.',
  },
  {
    commonNameTR: 'Semender', commonNameEN: 'Salamander',
    family: 'Salamandridae', familyTR: 'Semendergiller',
    order: 'Urodela', orderTR: 'Kuyruklu Kurbağalar',
    class: 'Amphibia', classTR: 'İkiyaşamlılar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦎', color: C.amphibian,
    description: 'Kuyruklu iki yaşamlılar; kayıp uzuvları yenileyebildikleriyle ünlüdür.',
  },

  // ── FISH ──────────────────────────────────────────────────────────
  {
    commonNameTR: 'Köpek Balığı', commonNameEN: 'Shark',
    family: 'Lamnidae', familyTR: 'Köpek Balıkları',
    order: 'Lamniformes', orderTR: 'Lamniformlar',
    class: 'Chondrichthyes', classTR: 'Kıkırdaklı Balıklar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🦈', color: C.fish,
    description: 'Dünyanın en eski hayvan gruplarından biri; 450 milyon yıldır değişmeden varlığını sürdürür.',
  },
  {
    commonNameTR: 'Balık', commonNameEN: 'Fish',
    family: 'Cyprinidae', familyTR: 'Sazangiller',
    order: 'Cypriniformes', orderTR: 'Sazanlar',
    class: 'Actinopterygii', classTR: 'Işınlı Yüzgeçli Balıklar',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐟', color: C.fish,
    description: 'Tatlı su ekosistemlerinin en çeşitli balık ailesi; 3.000\'den fazla tür içerir.',
  },
  {
    commonNameTR: 'Ahtapot', commonNameEN: 'Octopus',
    genus: 'Octopus',
    family: 'Octopodidae', familyTR: 'Ahtapotlar',
    order: 'Octopoda', orderTR: 'Sekiz Kollusular',
    class: 'Cephalopoda', classTR: 'Kafadan Bacaklılar',
    phylum: 'Mollusca', kingdom: 'Animalia',
    emoji: '🐙', color: C.fish,
    description: 'Omurgasızlar arasında en zeki canlılardan biri. Renk değiştirerek kamuflaj yapar.',
  },

  // ── INSECTA ───────────────────────────────────────────────────────
  {
    commonNameTR: 'Kelebek', commonNameEN: 'Butterfly',
    family: 'Nymphalidae', familyTR: 'Dört Ayaklı Kelebekler',
    order: 'Lepidoptera', orderTR: 'Pulkanatlılar',
    class: 'Insecta', classTR: 'Böcekler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🦋', color: C.insect,
    description: 'Tam başkalaşım geçiren kanatçıklar. Büyük çoğunluğu çiçek tozu taşır.',
  },
  {
    commonNameTR: 'Arı', commonNameEN: 'Bee',
    genus: 'Apis',
    family: 'Apidae', familyTR: 'Arıgiller',
    order: 'Hymenoptera', orderTR: 'Zarkanatlılar',
    class: 'Insecta', classTR: 'Böcekler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🐝', color: C.insect,
    description: 'Bitki ekosistemlerinin %70\'inden fazlası için tozlaştırıcı görevi üstlenir.',
  },
  {
    commonNameTR: 'Uğur Böceği', commonNameEN: 'Ladybug',
    family: 'Coccinellidae', familyTR: 'Uğur Böceği',
    order: 'Coleoptera', orderTR: 'Kın Kanatlılar',
    class: 'Insecta', classTR: 'Böcekler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🐞', color: C.insect,
    description: 'Zararlı yaprak bitleriyle beslendiğinden tarımda faydalı kabul edilen böcek.',
  },
  {
    commonNameTR: 'Karınca', commonNameEN: 'Ant',
    family: 'Formicidae', familyTR: 'Karıncagiller',
    order: 'Hymenoptera', orderTR: 'Zarkanatlılar',
    class: 'Insecta', classTR: 'Böcekler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🐜', color: C.insect,
    description: 'Yüksek sosyal organizasyonlarıyla ekosistemin mühendisleri. 20.000\'den fazla tür.',
  },
  {
    commonNameTR: 'Yusufçuk', commonNameEN: 'Dragonfly',
    family: 'Libellulidae', familyTR: 'Yusufçukgiller',
    order: 'Odonata', orderTR: 'Yusufçuklar',
    class: 'Insecta', classTR: 'Böcekler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🪲', color: C.insect,
    description: '300 milyon yıl önce ortaya çıkmış, dünyanın en eski uçan böceklerinden biri.',
  },

  // ── ARACHNIDA ─────────────────────────────────────────────────────
  {
    commonNameTR: 'Örümcek', commonNameEN: 'Spider',
    family: 'Araneidae', familyTR: 'Örümcekgiller',
    order: 'Araneae', orderTR: 'Örümcekler',
    class: 'Arachnida', classTR: 'Örümceksiler',
    phylum: 'Arthropoda', kingdom: 'Animalia',
    emoji: '🕷️', color: C.arachnid,
    description: 'İpek bezleriyle ağ ören, çoğu tür böcek avcısı olan 45.000\'den fazla türü olan takım.',
  },

  // ── MURIDAE / SCIURIDAE ───────────────────────────────────────────
  {
    commonNameTR: 'Fare / Sıçan', commonNameEN: 'Mouse / Rat',
    family: 'Muridae', familyTR: 'Faregiller',
    order: 'Rodentia', orderTR: 'Kemirgenler',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐭', color: C.mammal,
    description: 'Dünyanın en başarılı memeli ailesi; binlerce tür, her kıtada yaşar.',
  },
  {
    commonNameTR: 'Sincap', commonNameEN: 'Squirrel',
    family: 'Sciuridae', familyTR: 'Sincapgiller',
    order: 'Rodentia', orderTR: 'Kemirgenler',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐿️', color: C.mammal,
    description: 'Ağaç sincapları, yer sincapları ve uçan sincapları kapsayan geniş aile.',
  },

  // ── SUIDAE ────────────────────────────────────────────────────────
  {
    commonNameTR: 'Domuz', commonNameEN: 'Pig',
    binomial: 'Sus scrofa domesticus', genus: 'Sus',
    family: 'Suidae', familyTR: 'Domuzgiller',
    order: 'Artiodactyla', orderTR: 'Çift Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐷', color: C.mammal,
    description: 'Yüksek zeka kapasitesine sahip, 9000 yıl önce evcilleştirilmiş çift toynaklı.',
  },

  // ── CAMELIDAE ─────────────────────────────────────────────────────
  {
    commonNameTR: 'Deve', commonNameEN: 'Camel',
    family: 'Camelidae', familyTR: 'Devegiller',
    order: 'Artiodactyla', orderTR: 'Çift Toynaklılar',
    class: 'Mammalia', classTR: 'Memeliler',
    phylum: 'Chordata', kingdom: 'Animalia',
    emoji: '🐪', color: C.mammal,
    description: 'Hörgücünde yağ depolayan, su kaybına karşı fizyolojik adaptasyonları olan memeli.',
  },
]

// ─── PATTERN MATCHING ─────────────────────────────────────────────────────────

interface PatternGroup {
  patterns: string[]
  key: string  // matches a commonNameEN in TAXONOMY_DB
}

const PATTERN_GROUPS: PatternGroup[] = [
  // Human
  { key: 'Human', patterns: ['person', 'man', 'woman', 'human', 'people', 'face'] },
  // Dogs
  { key: 'Domestic Dog', patterns: [
    'dog', 'hound', 'retriever', 'shepherd', 'spaniel', 'poodle', 'terrier',
    'bulldog', 'beagle', 'labrador', 'dalmatian', 'chihuahua', 'pug', 'husky',
    'dachshund', 'maltese', 'boxer', 'rottweiler', 'doberman', 'wolfhound',
    'samoyed', 'malamute', 'spitz', 'collie', 'setter', 'pointer', 'whippet',
    'greyhound', 'borzoi', 'kelpie', 'corgi',
  ]},
  // Wolves/Foxes
  { key: 'Wolf', patterns: ['wolf', 'timber wolf', 'grey wolf', 'white wolf'] },
  { key: 'Fox', patterns: ['fox', 'vixen', 'arctic fox'] },
  // Cats
  { key: 'Domestic Cat', patterns: [
    'cat', 'kitten', 'tabby', 'persian', 'siamese', 'abyssinian', 'egyptian cat',
    'angora', 'ragdoll', 'bengal', 'maine coon', 'sphinx', 'bobcat',
  ]},
  { key: 'Lion', patterns: ['lion', 'lioness'] },
  { key: 'Tiger', patterns: ['tiger'] },
  { key: 'Leopard', patterns: ['leopard', 'jaguar', 'snow leopard'] },
  { key: 'Cheetah', patterns: ['cheetah'] },
  // Bears
  { key: 'Bear', patterns: ['bear', 'grizzly', 'brown bear', 'black bear', 'sun bear'] },
  { key: 'Polar Bear', patterns: ['polar bear', 'ice bear'] },
  { key: 'Giant Panda', patterns: ['panda', 'giant panda'] },
  // Horses / Equids
  { key: 'Horse', patterns: ['horse', 'stallion', 'mare', 'pony', 'mule', 'donkey', 'ass'] },
  { key: 'Zebra', patterns: ['zebra'] },
  // Bovids
  { key: 'Cattle', patterns: ['ox', 'bull', 'cow', 'cattle', 'bison', 'buffalo', 'gnu', 'wildebeest', 'yak'] },
  { key: 'Sheep', patterns: ['sheep', 'ram', 'lamb', 'goat', 'ibex', 'antelope', 'gazelle', 'deer'] },
  // Elephant
  { key: 'African Elephant', patterns: ['elephant', 'african elephant'] },
  { key: 'Asian Elephant', patterns: ['asian elephant', 'indian elephant'] },
  // Giraffe
  { key: 'Giraffe', patterns: ['giraffe'] },
  // Primates
  { key: 'Chimpanzee', patterns: ['chimpanzee', 'chimp', 'bonobo'] },
  { key: 'Gorilla', patterns: ['gorilla'] },
  { key: 'Monkey', patterns: ['monkey', 'baboon', 'macaque', 'lemur', 'langur', 'proboscis', 'colobus', 'orangutan', 'marmoset'] },
  // Marine mammals
  { key: 'Dolphin', patterns: ['dolphin', 'whale', 'orca', 'seal', 'sea lion', 'walrus', 'manatee'] },
  // Rabbits
  { key: 'Rabbit', patterns: ['rabbit', 'hare', 'bunny'] },
  // Rodents
  { key: 'Mouse / Rat', patterns: ['mouse', 'rat', 'hamster', 'gerbil', 'guinea pig', 'vole', 'marmot'] },
  { key: 'Squirrel', patterns: ['squirrel', 'chipmunk', 'beaver', 'muskrat'] },
  // Pig
  { key: 'Pig', patterns: ['pig', 'hog', 'swine', 'boar', 'warthog'] },
  // Camel
  { key: 'Camel', patterns: ['camel', 'dromedary', 'bactrian', 'llama', 'alpaca'] },
  // Birds
  { key: 'Eagle', patterns: ['eagle', 'hawk', 'falcon', 'osprey', 'vulture', 'kite', 'harrier', 'buzzard', 'condor'] },
  { key: 'Owl', patterns: ['owl', 'barn owl', 'horned owl', 'screech owl'] },
  { key: 'Parrot', patterns: ['parrot', 'macaw', 'cockatoo', 'cockatiel', 'parakeet', 'lovebird', 'budgerigar'] },
  { key: 'Penguin', patterns: ['penguin'] },
  { key: 'Flamingo', patterns: ['flamingo'] },
  { key: 'Peacock', patterns: ['peacock', 'peafowl'] },
  { key: 'Crow / Raven', patterns: ['crow', 'raven', 'magpie', 'jay', 'rook', 'jackdaw'] },
  { key: 'Pelican', patterns: ['pelican', 'stork', 'heron', 'ibis', 'spoonbill'] },
  { key: 'Songbird', patterns: [
    'sparrow', 'robin', 'finch', 'canary', 'warbler', 'swift', 'swallow',
    'thrush', 'blackbird', 'nightingale', 'wren', 'tit', 'nuthatch', 'woodpecker',
    'bunting', 'starling', 'pigeon', 'dove', 'duck', 'goose', 'swan', 'flamingo',
    'turkey', 'chicken', 'rooster', 'hen', 'grouse', 'pheasant', 'quail', 'toucan',
    'hummingbird', 'kingfisher', 'bee eater', 'bird',
  ]},
  // Reptiles
  { key: 'Crocodile', patterns: ['crocodile', 'alligator', 'gharial', 'caiman'] },
  { key: 'Tortoise / Turtle', patterns: ['tortoise', 'turtle', 'terrapin'] },
  { key: 'Snake', patterns: [
    'snake', 'python', 'boa', 'cobra', 'viper', 'mamba', 'anaconda',
    'rattlesnake', 'copperhead', 'garter snake', 'king snake',
  ]},
  { key: 'Iguana', patterns: ['iguana'] },
  { key: 'Lizard', patterns: ['lizard', 'gecko', 'skink', 'monitor', 'chameleon', 'anole', 'frilled lizard', 'gila monster'] },
  // Amphibia
  { key: 'Frog', patterns: ['frog', 'toad', 'treefrog', 'bullfrog'] },
  { key: 'Salamander', patterns: ['salamander', 'newt', 'axolotl'] },
  // Fish
  { key: 'Shark', patterns: ['shark', 'ray', 'stingray', 'hammerhead', 'great white'] },
  { key: 'Fish', patterns: ['fish', 'goldfish', 'nemo', 'carp', 'tuna', 'salmon', 'trout', 'bass', 'perch', 'eel', 'cod', 'herring', 'catfish', 'clownfish', 'puffer', 'seahorse'] },
  { key: 'Octopus', patterns: ['octopus', 'squid', 'jellyfish', 'crab', 'lobster', 'shrimp', 'barnacle', 'mussel', 'oyster', 'clam', 'starfish', 'sea urchin'] },
  // Insects
  { key: 'Butterfly', patterns: ['butterfly', 'moth', 'caterpillar', 'monarch', 'swallowtail'] },
  { key: 'Bee', patterns: ['bee', 'wasp', 'hornet', 'bumblebee', 'yellow jacket'] },
  { key: 'Ladybug', patterns: ['ladybug', 'ladybird', 'beetle', 'weevil', 'firefly', 'dung beetle', 'longhorn'] },
  { key: 'Ant', patterns: ['ant', 'termite', 'stick insect', 'mantis', 'cockroach', 'cricket', 'grasshopper', 'locust'] },
  { key: 'Dragonfly', patterns: ['dragonfly', 'damselfly', 'mayfly', 'fly', 'mosquito', 'gnat', 'midge'] },
  // Arachnids
  { key: 'Spider', patterns: ['spider', 'tarantula', 'scorpion', 'tick', 'mite', 'harvestman'] },
]

// Build lookup map
const TAXONOMY_MAP = new Map<string, BioTaxonomy>(
  TAXONOMY_DB.map(t => [t.commonNameEN.toLowerCase(), t])
)

export function getTaxonomy(rawLabel: string): BioTaxonomy | null {
  const label = normalizeLabel(rawLabel)
  // Build a set of full words for word-boundary matching
  const labelWords = new Set(label.split(/[\s,_\-']+/).filter(w => w.length > 1))

  for (const group of PATTERN_GROUPS) {
    const match = group.patterns.some(p => {
      if (p.includes(' ')) {
        // Multi-word pattern: substring match is fine
        return label.includes(p)
      }
      // Single-word pattern: must be a full word, not a substring
      return labelWords.has(p)
    })
    if (match) {
      const found = TAXONOMY_MAP.get(group.key.toLowerCase())
      if (found) return found
    }
  }

  return TAXONOMY_MAP.get(label) ?? null
}

function normalizeLabel(label: string): string {
  return label
    .replace(/^n\d+ /, '')
    .toLowerCase()
    .split(',')[0]
    .replace(/_/g, ' ')
    .trim()
}

export const CLASS_COLORS: Record<string, string> = {
  Mammalia: '#00ff9d',
  Aves: '#00d4ff',
  Reptilia: '#ffcc00',
  Amphibia: '#ff6b35',
  Actinopterygii: '#7b2fff',
  Chondrichthyes: '#7b2fff',
  Insecta: '#ff3366',
  Arachnida: '#ff9d00',
  Cephalopoda: '#a78bfa',
  default: '#94a3b8',
}

export function getClassColor(cls: string): string {
  return CLASS_COLORS[cls] ?? CLASS_COLORS.default
}
