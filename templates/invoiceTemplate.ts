import { InvoiceType, WorkInformationType, PaymentType, UserType, CustomerType, BankDetailsType } from '@/db/zodSchema';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';

interface TemplateData {
    data: InvoiceType & {
        workItems: WorkInformationType[];
        payments: PaymentType[];
        user: UserType;
        customer: CustomerType;
        bankDetails: BankDetailsType;
        notes?: string;
    };
    subtotal: number;
    tax: number;
    total: number;
}

const customFormat = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const generateInvoiceHtml = ({ data, subtotal, tax, total }: TemplateData): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root {
    --primary: #F3EDE2;
    --primary-light: #ede4d4;
    --secondary: #38BDF8;
    --accent: #F59E0B;
    --text-light: #8B5E3C;
    --text-dark: #ede4d4;
    --danger: #EF4444;
    --muted-foreground: #64748B;
}

body {
    background-color: var(--primary-light);
    font-family: sans-serif;
    color: var(--text-light);
    margin: 0;
    padding: 20px;
}

.container {
    margin: 20px 0;
    padding:20px;
    background-color: var(--primary);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
}

.header {
    border-bottom: 1px solid var(--text-light);
    padding-bottom: 10px;
}

.invoice-title {
    font-size: 1.875rem;
    font-weight: bold;
    color: var(--text-light);
    margin: 0 0 8px 0;
}

.date {
    color: var(--text-light);
    margin: 4px 0;
}

.grid-container {
    display: grid;
    width:100%;
    grid-template-columns: 1fr 1fr;
    margin-bottom: 32px;
    justify-content: space-between;
    gap:70px;
}


.section-title {
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 8px;
    color: var(--accent);
}

table {
    min-width: 100%;
    margin-bottom: 32px;
    border-collapse: collapse;
}

thead tr {
    background-color: var(--primary-light);
}

th {
    text-align: left;
    padding: 8px;
}

td {
    padding: 8px;
}

.underline {
    border-bottom: 1px solid var(--text-light);
}

tfoot tr {
    font-weight: bold;
}

tfoot tr:last-child {
    font-size: 1.125rem;
}

.payments-section {
    margin-top: 32px;
}
.txt-small {
    font-size:12px
}
notes-container {
    margin-top: 20px;
    padding: 20px;
    border-top: 1px solid var(--text-light);
}
notes-header {
    color: var(--text-light);
    margin-bottom: 10px;
    background-color: var(--primary-light);
}
notes-txt {
    color:var(--text-light);
    white-space: pre-wrap;
}

    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 class="invoice-title">Invoice #${data.id}</h1>
            <p class="date txt-small">Due: ${customFormat(new Date(data.dueDate))}</p>
        </div>

        <div class="grid-container">
            <div>
                <h2 class="section-title">From:</h2>
                <p class="txt-small">${data.user.fullName}</p>
                <p class="txt-small">UTR: ${data.user.utrNumber}</p>
                <p class="txt-small">NIN: ${data.user.ninNumber}</p>
                <p class="txt-small">${data.user.emailAddress}</p>
                <p class="txt-small">${data.user.phoneNumber}</p>
            </div>
            <div>
                <h2 class="section-title">To:</h2>
                <p class="txt-small">${data.customer.name}</p>
                <p class="txt-small">${data.customer.emailAddress}</p>
                <p class="txt-small">${data.customer.phoneNumber}</p>
            </div>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                ${data.workItems
            .map(
                (item, index) => `
                    <tr key=${index}>
                        <td>${item.date}</td>
                        <tr class="underline">
                            <td>${item.descriptionOfWork}</td>
                            <td>${getCurrencySymbol(data.currency)}${item.unitPrice.toFixed(2)}</td>
                        </tr>
                    </tr>
                `
            )
            .join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td>Subtotal:</td>
                    <td>${getCurrencySymbol(data.currency)}${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Tax (${data.taxRate}%):</td>
                    <td>${getCurrencySymbol(data.currency)}${tax.toFixed(2)}</td>
                </tr>
                <tr>
                    <td>Total:</td>
                    <td>${getCurrencySymbol(data.currency)}${total.toFixed(2)}</td>
                </tr>
            </tfoot>
        </table>
        <div>
             ${data.notes ? `
        <div class="notes-container">
            <h3 class="notes-header">Notes:</h3>
            <p class="notes-txt">${data.notes}</p>
        </div>
    ` : ''}
        </div>

        <div>
            <h2 class="section-title">Bank Details:</h2>
            <p class="txt-small">Bank Name: ${data.bankDetails.bankName}</p>
            <p class="txt-small">Account Name: ${data.bankDetails.accountName}</p>
            <p class="txt-small">Account Number: ${data.bankDetails.accountNumber}</p>
            <p class="txt-small">Sort Code: ${data.bankDetails.sortCode}</p>
        </div>
    </div>

</body>
</html>
  `;
};