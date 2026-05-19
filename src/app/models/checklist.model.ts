export interface ChecklistItem {
  sno: number;
  name: string;
}

export interface ChecklistGroup {
  title: string;
  items: ChecklistItem[];
}
