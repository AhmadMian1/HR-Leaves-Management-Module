using CsvHelper;
using CsvHelper.Configuration;
using HRLeaves.API.DTOs.LeaveRequest;
using System.Globalization;
using System.Text;

namespace HRLeaves.API.Helpers;

public static class CsvExporter
{
    public static byte[] ExportLeaveRequests(IEnumerable<LeaveRequestDto> requests)
    {
        var config = new CsvConfiguration(CultureInfo.InvariantCulture)
        {
            HasHeaderRecord = true
        };

        using var ms = new MemoryStream();
        using var writer = new StreamWriter(ms, Encoding.UTF8);
        using var csv = new CsvWriter(writer, config);

        csv.WriteHeader<LeaveRequestCsvRecord>();
        csv.NextRecord();

        foreach (var r in requests)
        {
            csv.WriteRecord(new LeaveRequestCsvRecord
            {
                Id = r.Id,
                EmployeeName = r.EmployeeName,
                LeaveType = r.LeaveTypeName,
                StartDate = r.StartDate.ToString("yyyy-MM-dd"),
                EndDate = r.EndDate.ToString("yyyy-MM-dd"),
                DaysRequested = r.DaysRequested,
                Status = r.Status,
                Reason = r.Reason,
                RejectionComment = r.RejectionComment ?? string.Empty,
                CreatedAt = r.CreatedAt.ToString("yyyy-MM-dd HH:mm")
            });
            csv.NextRecord();
        }

        writer.Flush();
        return ms.ToArray();
    }

    private class LeaveRequestCsvRecord
    {
        public int Id { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string LeaveType { get; set; } = string.Empty;
        public string StartDate { get; set; } = string.Empty;
        public string EndDate { get; set; } = string.Empty;
        public decimal DaysRequested { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string RejectionComment { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = string.Empty;
    }
}
