export const blocks = [
  {
    id: 'text',
    label: 'Text',
    content: '<div data-gjs-type="text">Insert your text here</div>',
  },
  {
    id: 'image',
    label: 'Image',
    select: true,
    content: { type: 'image' },
    activate: true,
  },
  {
    id: 'quote',
    label: 'Quote',
    content: '<blockquote data-gjs-type="text">Quote text</blockquote>',
  },
];
