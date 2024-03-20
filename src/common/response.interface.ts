export interface IPaginationMeta {
    next: string;
    prev: string;
}

export interface IListResponse<T> {
    meta: IPaginationMeta;
    data: T[];
}
