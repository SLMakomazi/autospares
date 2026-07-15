#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const { createClient } = require('@sanity/client')

const projectId = 'dk7b61f9'
const dataset = 'production'
const token = process.env.SANITY_TOKEN

if (!token) {
  console.error('\nERROR: SANITY_TOKEN environment variable is required and must have write permissions.\n')
  process.exit(1)
}

const client = createClient({
  projectId,
  dataset,
  token,
  useCdn: false,
  apiVersion: '2024-01-01',
})

const sharedImagePath = path.resolve(__dirname, '..', '..', 'web', 'public', 'sparesImage.jfif')

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

async function uploadSharedImage() {
  if (!fs.existsSync(sharedImagePath)) {
    throw new Error('Shared image not found: ' + sharedImagePath)
  }
  const stream = fs.createReadStream(sharedImagePath)
  const asset = await client.assets.upload('image', stream, { filename: path.basename(sharedImagePath) })
  return asset
}

async function createDocs() {
  try {
    console.log('Uploading shared image...')
    const asset = await uploadSharedImage()
    console.log('Image uploaded:', asset._id)

    const brands = [
      { name: 'Toyota', isVehicleManufacturer: true, description: 'Reliable vehicles and OEM parts' },
      { name: 'Volkswagen', isVehicleManufacturer: true, description: 'German engineering and spare parts' },
      { name: 'Bosch', isVehicleManufacturer: false, description: 'Aftermarket and electrical components' },
    ]

    const createdBrands = {}
    for (const b of brands) {
      const doc = {
        _type: 'brand',
        name: b.name,
        slug: { _type: 'slug', current: slugify(b.name) },
        description: b.description || '',
        isVehicleManufacturer: !!b.isVehicleManufacturer,
      }
      const res = await client.create(doc)
      createdBrands[b.name] = res._id
      console.log('Created brand:', b.name)
    }

    const categories = [
      { title: 'Engine Parts' },
      { title: 'Electrical' },
      { title: 'Lubricants / Oils' },
    ]

    const createdCategories = {}
    for (const c of categories) {
      const doc = {
        _type: 'category',
        title: c.title,
        slug: { _type: 'slug', current: slugify(c.title) },
      }
      const res = await client.create(doc)
      createdCategories[c.title] = res._id
      console.log('Created category:', c.title)
    }

    const carModels = [
      { name: 'Hilux', brand: 'Toyota', generation: 'N300', years: ['2016', '2017', '2018'] },
      { name: 'Polo', brand: 'Volkswagen', generation: '6R', years: ['2015', '2016'] },
      { name: 'Golf', brand: 'Volkswagen', generation: 'MK7', years: ['2014', '2015', '2016'] },
      { name: 'Corolla', brand: 'Toyota', generation: 'E170', years: ['2014', '2015', '2016'] },
    ]

    const createdModels = {}
    for (const m of carModels) {
      const doc = {
        _type: 'carModel',
        name: m.name,
        brand: { _type: 'reference', _ref: createdBrands[m.brand] },
        generation: m.generation || '',
        years: m.years || [],
      }
      const res = await client.create(doc)
      createdModels[m.name] = res._id
      console.log('Created car model:', m.name)
    }

    const products = [
      {
        name: 'Front Brake Pads Set',
        sku: 'FP-1000',
        partNumber: 'BP-1234',
        category: 'Engine Parts',
        partBrand: 'Bosch',
        price: 450,
        isAvailable: true,
        condition: 'new',
        compatibleVehicles: [
          { model: 'Hilux', engineSizes: ['2.8'] },
        ],
        specifications: [ { key: 'Material', value: 'Semi-metallic' } ],
      },
      {
        name: 'Spark Plug (Iridium)',
        sku: 'SP-2000',
        partNumber: 'IR-5678',
        category: 'Electrical',
        partBrand: 'Bosch',
        price: 120,
        isAvailable: true,
        condition: 'new',
        compatibleVehicles: [ { model: 'Polo', engineSizes: ['1.4'] }, { model: 'Golf', engineSizes: ['1.4'] } ],
        specifications: [ { key: 'Gap', value: '0.8mm' } ],
      },
      {
        name: 'Engine Oil 5W-30 5L',
        sku: 'OIL-500',
        partNumber: 'O5W30-5L',
        category: 'Lubricants / Oils',
        partBrand: 'Bosch',
        price: 399,
        isAvailable: true,
        condition: 'new',
        compatibleVehicles: [ { model: 'Corolla', engineSizes: ['1.8'] }, { model: 'Hilux', engineSizes: ['2.8'] } ],
        specifications: [ { key: 'Viscosity', value: '5W-30' }, { key: 'Volume', value: '5L' } ],
      },
    ]

    for (const p of products) {
      const doc = {
        _type: 'product',
        name: p.name,
        slug: { _type: 'slug', current: slugify(p.name) },
        sku: p.sku,
        partNumber: p.partNumber,
        category: { _type: 'reference', _ref: createdCategories[p.category] },
        partBrand: { _type: 'reference', _ref: createdBrands[p.partBrand] },
        price: p.price,
        isAvailable: p.isAvailable,
        condition: p.condition,
        compatibleVehicles: (p.compatibleVehicles || []).map(cv => ({
          _type: 'vehicleFitment',
          model: { _type: 'reference', _ref: createdModels[cv.model] },
          engineSizes: cv.engineSizes || [],
        })),
        specifications: (p.specifications || []).map(s => ({ _type: 'spec', key: s.key, value: s.value })),
        images: [ { _type: 'image', asset: { _type: 'reference', _ref: asset._id } } ],
        description: [ { _type: 'block', _key: 'b1', children: [ { _type: 'span', text: p.name + ' - quality part.' } ] } ],
      }
      const res = await client.create(doc)
      console.log('Created product:', p.name)
    }

    console.log('\nSeeding complete.')
  } catch (err) {
    console.error('Seeding failed:', err)
    process.exit(1)
  }
}

createDocs()
