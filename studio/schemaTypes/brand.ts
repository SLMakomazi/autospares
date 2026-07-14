import { defineField, defineType } from 'sanity'

export const brandType = defineType({
  name: 'brand',
  title: 'Brands',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Brand Name',
      type: 'string',
      description: 'e.g., Volkswagen, Toyota, Bosch, Castrol',
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
      name: 'logo',
      title: 'Brand Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'isVehicleManufacturer',
      title: 'Is this a Vehicle Manufacturer?',
      type: 'boolean',
      description: 'Turn on if this is a car brand (like BMW). Turn off if it is only a parts brand (like Bosch).',
      initialValue: false,
    }),
  ],
})