namespace HRLeaves.API.DTOs.Common;

public class PagedResponse<T>
{
    public List<T> Data { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageNumber { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    public static PagedResponse<T> Create(List<T> data, int totalCount, int pageNumber, int pageSize) =>
        new() { Data = data, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize };
}
