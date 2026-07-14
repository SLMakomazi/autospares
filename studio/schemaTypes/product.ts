import { defineField, defineType, defineArrayMember } from 'sanity'

export const productType = defineType({
  name: 'product',
  title: 'Products / Auto Parts',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Product Name',
      type: 'string',
      description: 'e.g., Castrol Edge 5W-30 Engine Oil 5L, Front Brake Pads Set',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'sku',
      title: 'SKU / Internal Stock Code',
      type: 'string',
      description: 'Your unique stock tracking code',
    }),
    defineField({
      name: 'partNumber',
      title: 'Manufacturer Part Number (MPN)',
      type: 'string',
      description: 'The number stamped on the physical part (essential for buyer searches)',
    }),
    defineField({
      name: 'oemNumber',
      title: 'Cross-Reference / OEM Number',
      type: 'string',
      description: 'Original car manufacturer part numbers this replaces',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'partBrand',
      title: 'Part Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      description: 'Who manufactured this physical item (e.g., GUD, Ferodo, NGK)',
    }),
    defineField({
      name: 'price',
      title: 'Price (ZAR)',
      type: 'number',
      description: 'Set to 0 or leave blank to display "Contact for Price"',
    }),
    defineField({
      name: 'isAvailable',
      title: 'In Stock / Available',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'condition',
      title: 'Condition',
      type: 'string',
      options: {
        list: [
          { title: 'New / Aftermarket', value: 'new' },
          { title: 'Used (Tested Good)', value: 'used' },
          { title: 'Reconditioned', value: 'reconditioned' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'compatibleVehicles',
      title: 'Compatible Vehicles',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'vehicleFitment',
          fields: [
            {
              name: 'model',
              type: 'reference',
              to: [{ type: 'carModel' }],
              title: 'Car Model',
            },
            {
              name: 'engineSizes',
              type: 'array',
              of: [defineArrayMember({ type: 'string' })],
              title: 'Specific Engine Sizes (e.g. 1.4, 2.0 TDI)',
            },
          ],
        }),
      ],
    }),
    defineField({
      name: 'specifications',
      title: 'Technical Specifications',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'spec',
          fields: [
            { name: 'key', title: 'Property (e.g., Voltage, Viscosity, Volume)', type: 'string' },
            { name: 'value', title: 'Value (e.g., 12V, 5W-30, 5 Litres)', type: 'string' },
          ],
        }),
      ],
    }),
    defineField({
      name: 'images',
      title: 'Product Images',
      type: 'array',
      of: [defineArrayMember({ type: 'image', options: { hotspot: true } })],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'blockContent',
    }),
  ],
})