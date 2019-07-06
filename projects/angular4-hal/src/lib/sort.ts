export type SortOrder = 'DESC' | 'ASC';

export interface Sort {
    path: string;
    order: SortOrder;
}