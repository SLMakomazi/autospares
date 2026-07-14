import { defineField, defineType, defineArrayMember } from 'sanity'

export const carModelType = defineType({
  name: 'carModel',
  title: 'Car Models',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Model Name',
      type: 'string',
      description: 'e.g., Polo, Golf, Hilux, 3 Series',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'brand',
      title: 'Vehicle Brand',
      type: 'reference',
      to: [{ type: 'brand' }],
      options: {
        filter: 'isVehicleManufacturer == true',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'generation',
      title: 'Generation / Chassis Code',
      type: 'string',
      description: 'e.g., MK6, E90, GD-6',
    }),
    defineField({
      name: 'years',
      title: 'Production Years',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'Add years this model was built, e.g., 2015, 2016, 2017',
    }),
    defineField({
      name: 'engineCodes',
      title: 'Compatible Engine Codes',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'e.g., CLPA, CFNA, 1KD-FTV',
    }),
  ],
})