# Expresso: Frappe and ERPNext Data Entry Made Easy ☕

## Why Expresso?
Frappe document creation often involves:
- Monotonous manual entry for common fields
- Scrolling though dropdown links or searching for reference values and clearing wrong values
- Referencing previous documents to copy values
- Maintaining consistency across team members

Expresso solves this with **context-aware defaults for any document type**.
- Speed up any document creation with smart suggestions
- Reduce repetitive typing across all Frappe documents

---

## Features
| Feature                  | Benefit                                      |
|--------------------------|----------------------------------------------|
| **Universal Auto-Fill** | Accelerate data entry in _any_ document type |
| **Frequency-Based Patterns** | "What entries are typically used here?" |
| **Team-Wide Consistency** | Standardize entries across users |
| **Adaptive System**    | Improves with every document created |

---

## Setup
1. **Install the app**:
   ```bash
   bench get-app https://github.com/dawoodjee/expresso
   bench install-app expresso
   ```
2. **Enable Suggestions**:  
   Activate in `Expresso > Settings` for specific doctypes.

---

## How It Works
**Core Pattern**  
1. Open any document (Sales Invoice, Project Task, Employee Record, etc.)  
2. Expresso analyzes:
   - Field types (link, select, date, etc.)
   - Your team's historical data
   - Related documents in the system
3. Receive smart suggestions as you type

**Example Workflows**  
*Creating a Sales Invoice* → Suggests:  
- Most likely next customer, going by buying patterns
- Common items sold to this customer, along with likely quantities  
- Applicable taxes  
- Common payment terms for this territory  
- Default due date based on typical payment terms


---

## Goals
**Current Focus**  
- Support all core Frappe doctypes out of the box

**Future Vision**  
- Custom pattern recognition for custom doctypes
- Field-level prediction engine
- Complete data privacy - all processing happens locally, no external APIs

---

## Why "Expresso"?
- **Universal**: Works wherever you create documents  
- **Consistent**: Maintain standards across all departments
- **Streamlined**: Eliminate repetitive data entry

---

## License  
MIT - Free for all ERPNext users
