using System.Text.Json.Serialization;

namespace PersonalFinanceManagement.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; } //For example, the amount of income or expense 
        public DateTime Date { get; set; } // Transaction Date
        public string Category { get; set; } // Transaction category (Example: "Income", "Expense", "Investment")
        public string Description { get; set; } // Transaction description (Example: "loans", "Grocery shopping")
        public int UserId { get; set; } // The user who did this action

        [JsonIgnore]
        public User? User { get; set; }

    }
}
