// src/types/navigation.ts

export interface NavItem {
  title: string;
  href: string;
  children?: NavItem[];
}

export interface ListItemProps {
  title: string;
  href: string;
}

export interface MobileAccordionItemProps {
  title: string;
  items: NavItem[];
}
