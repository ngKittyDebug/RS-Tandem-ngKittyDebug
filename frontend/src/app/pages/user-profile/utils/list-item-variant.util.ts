export interface ListItemVariant {
  icon: string;
}

const LIST_ITEM_VARIANTS: readonly ListItemVariant[] = [
  { icon: '@tui.cat' },
  { icon: '@tui.paw-print' },
  { icon: '@tui.gamepad-2' },
] as const;

export function getListItemVariant(index: number): ListItemVariant {
  return LIST_ITEM_VARIANTS[index % LIST_ITEM_VARIANTS.length];
}
