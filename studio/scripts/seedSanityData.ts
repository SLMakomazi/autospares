import { getCliClient } from 'sanity/cli'

const client = getCliClient()

const sharedImagePath = '../web/public/sparesImage.jfif'

const brands = [
  {
    _type: 'brand',
    _id: 'brand-toyota',
    name: 'Toyota',
    slug: { _type: 'slug', current: 'toyota' },
    description: 'Trusted Japanese manufacturer known for durability and reliability.',
    isVehicleManufacturer: true,
  },
  {
    _type: 'brand',
    _id: 'brand-volkswagen',
    name: 'Volkswagen',
    slug: { _type: 'slug', current: 'volkswagen' },
    description: 'Leading European automaker with a broad range of passenger and commercial vehicles.',
    isVehicleManufacturer: true,
  },
  {
    _type: 'brand',
    _id: 'brand-bosch',
    name: 'Bosch',
    slug: { _type: 'slug', current: 'bosch' },
    description: 'Aftermarket and replacement parts specialist for automotive and industrial systems.',
    isVehicleManufacturer: false,
  },
  {
    _type: 'brand',
    _id: 'brand-ngk',
    name: 'NGK',
    slug: { _type: 'slug', current: 'ngk' },
    description: 'Global leader in spark plugs, ignition components and sensors.',
    isVehicleManufacturer: false,
  },
]

const categories = [
  {
    _type: 'category',
    _id: 'category-engine-parts',
    title: 'Engine Parts',
    slug: { _type: 'slug', current: 'engine-parts' },
    description: 'Internal engine components and service items.',
  },
  {
    _type: 'category',
    _id: 'category-electrical',
    title: 'Auto Electrical',
    slug: { _type: 'slug', current: 'auto-electrical' },
    description: 'Ignition, sensors, batteries and electrical accessories.',
  },
  {
    _type: 'category',
    _id: 'category-oil',
    title: 'Lubricants & Oil',
    slug: { _type: 'slug', current: 'lubricants-oil' },
    description: 'Engine oils, transmission fluids and lubricants for service maintenance.',
  },
]

const carModels = [
  {
    _type: 'carModel',
    _id: 'carmodel-toyota-corolla',
    name: 'Corolla',
    brand: { _type: 'reference', _ref: 'brand-toyota' },
    generation: 'E210',
    years: ['2018', '2019', '2020', '2021', '2022'],
    engineCodes: ['2ZR-FE', '1ZR-FE'],
  },
  {
    _type: 'carModel',
    _id: 'carmodel-vw-polo',
    name: 'Polo',
    brand: { _type: 'reference', _ref: 'brand-volkswagen' },
    generation: 'AW',
    years: ['2019', '2020', '2021', '2022'],
    engineCodes: ['CZW', 'CGP'],
  },
]

const products = [
  {
    _type: 'product',
    _id: 'product-5w30-oil-5l',
    name: 'Castrol EDGE 5W-30 Engine Oil 5L',
    slug: { _type: 'slug', current: 'castrol-edge-5w-30-engine-oil-5l' },
    sku: 'CAST-5W30-5L',
    partNumber: 'EC-5W30-5L',
    oemNumber: '0-5W30-5L',
    category: { _type: 'reference', _ref: 'category-oil' },
    partBrand: { _type: 'reference', _ref: 'brand-bosch' },
    price: 895,
    isAvailable: true,
    condition: 'new',
    compatibleVehicles: [
      {
        _type: 'vehicleFitment',
        model: { _type: 'reference', _ref: 'carmodel-toyota-corolla' },
        engineSizes: ['1.8', '2.0'],
      },
      {
        _type: 'vehicleFitment',
        model: { _type: 'reference', _ref: 'carmodel-vw-polo' },
        engineSizes: ['1.0', '1.4'],
      },
    ],
    specifications: [
      { _type: 'spec', key: 'Viscosity', value: '5W-30' },
      { _type: 'spec', key: 'Volume', value: '5 Litres' },
      { _type: 'spec', key: 'Type', value: 'Fully Synthetic' },
    ],
    description: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'Premium fully synthetic engine oil designed for modern petrol and diesel engines.',
          },
        ],
      },
    ],
  },
  {
    _type: 'product',
    _id: 'product-spark-plug-ngk',
    name: 'NGK Spark Plug BKR6E',
    slug: { _type: 'slug', current: 'ngk-spark-plug-bkr6e' },
    sku: 'NGK-BKR6E',
    partNumber: 'BKR6E',
    oemNumber: '0-BKR6E',
    category: { _type: 'reference', _ref: 'category-electrical' },
    partBrand: { _type: 'reference', _ref: 'brand-ngk' },
    price: 125,
    isAvailable: true,
    condition: 'new',
    compatibleVehicles: [
      {
        _type: 'vehicleFitment',
        model: { _type: 'reference', _ref: 'carmodel-toyota-corolla' },
        engineSizes: ['1.8'],
      },
    ],
    specifications: [
      { _type: 'spec', key: 'Electrode Gap', value: '0.9mm' },
      { _type: 'spec', key: 'Thread Size', value: '14mm' },
    ],
    description: [
      {
        _type: 'block',
        style: 'normal',
        children: [
          {
            _type: 'span',
            text: 'High-performance NGK spark plug for reliable ignition and long service life.',
          },
        ],
      },
    ],
  },
]

async function uploadSharedImage(document) {
  const asset = await client.assets.upload('image', sharedImagePath, {
    filename: 'sparesImage.jfif',
  })

  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } }
}

async function run() {
  try {
    console.log('Seeding brands and categories...')
    await client.transaction()
      .createIfNotExists(brands[0])
      .createIfNotExists(brands[1])
      .createIfNotExists(brands[2])
      .createIfNotExists(brands[3])
      .createIfNotExists(categories[0])
      .createIfNotExists(categories[1])
      .createIfNotExists(categories[2])
      .commit({ visibility: 'async' })

    console.log('Seeding car models...')
    await client.transaction()
      .createIfNotExists(carModels[0])
      .createIfNotExists(carModels[1])
      .commit({ visibility: 'async' })

    console.log('Uploading shared image...')
    const image = await uploadSharedImage({})

    console.log('Seeding products...')
    const productMutations = products.map((product) => ({
      ...product,
      images: [image],
    }))

    await client.transaction(
      productMutations.map((product) => ({ createIfNotExists: product }))
    ).commit({ visibility: 'async' })

    console.log('Seeding complete.')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  }
}

run()
