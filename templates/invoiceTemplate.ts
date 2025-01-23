import { InvoiceType, WorkInformationType, PaymentType, UserType, CustomerType, BankDetailsType } from '@/db/zodSchema';
import { getCurrencySymbol } from '@/utils/getCurrencySymbol';

interface ThemeColors {
    primary?: string;
    primaryLight?: string;
    secondary?: string;
    accent?: string;
    textLight?: string;
    textDark?: string;
    danger?: string;
    mutedForeground?: string;
}
interface TemplateData {
    data: InvoiceType & {
        workItems: WorkInformationType[];
        payments: PaymentType[];
        user: UserType;
        customer: CustomerType;
        bankDetails: BankDetailsType;
        notes?: string;
        paymants?: PaymentType[];
    };

    subtotal: number;
    tax: number;
    total: number;
    remainingBalance: number;
    themeColors?: ThemeColors
}

const defaultColors: ThemeColors = {
    primary: '#F3EDE2',
    primaryLight: '#ede4d4',
    secondary: '#38BDF8',
    accent: '#F59E0B',
    textLight: '#8B5E3C',
    textDark: '#ede4d4',
    danger: '#EF4444',
    mutedForeground: '#64748B'
};

const customFormat = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

export const generateInvoiceHtml = ({ data, subtotal, tax, total, themeColors }: TemplateData): string => {
    const colors = { ...defaultColors, ...themeColors }
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      :root {
        --primary: ${colors.primary};
        --primary-light: ${colors.primaryLight};
        --secondary: ${colors.secondary};
        --accent: ${colors.accent};
        --text-light: ${colors.textLight};
        --text-dark: ${colors.textDark};
        --danger: ${colors.danger};
        --muted-foreground: ${colors.mutedForeground};
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

        .header:has(img) {
            display:flex;
            justify-content:space-between;
            align-items:center;
            border-bottom: 1px solid var(--text-light);
            padding-bottom: 10px;
        }
        .header:not(:has(img)) {
            display:flex;
            justify-content:start;
            align-items:center;
            border-bottom: 1px solid var(--text-light);
            padding-bottom: 10px;
        }

        .invoice-title {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--text-light);
            margin: 0 0 8px 0;
        }

        .date {
            color: var(--text-light);
            margin: 4px 0;
        }

        .grid-container {
            display:flex;
            width:full;
            justify-content:space-between;
        }


        .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--accent);
        }
        .bold{
            font-weight: bold;
        }

        table {
            width:100% ;
            margin-bottom: 32px;
            border-collapse: collapse;
            background-color: var(--primary-light);
        }

        thead{

        }
        thead tr {
            width:100%;

        }

        th {
            text-align: left;
            padding: 8px;
        }

        td {
            padding: 8px;
            text-transform: capitalize;
        }

        .underline {
            border-bottom: 1px solid var(--text-light);
        }

        tfoot tr {
        font-size: 0.875rem;
            font-weight: bold;
        }

        tfoot tr:last-child {
            font-size: 1.125rem;
        }
        .align{
            text-align: end;
        }
        .padding{
            padding-left: 1rem;
        }
        .normal{
            font-weight: normal;
        }

        .payments-section {
            margin-top: 32px;
        }
        .txt-small {
            font-size:10px;
        }
        .notes-container {
            margin-top: 20px;
            padding-inline:10px;
            border: 1px solid var(--text-light);
        }
        .notes-header {
            color: var(--text-light);
            margin-bottom: 10px;
        }
        .notes-txt {
            font-size:12px;
            color:var(--text-light);
            white-space: pre-wrap;
        }

    </style>
</head>
<body>
    <div class="container">
        <div class="header">
          <div class="logo">
               <! --  <img src="https://github.com/user-attachments/assets/1071f4fa-4cf4-4d08-978f-0267b301a4e4" width="100px" />
            </div>
            <div>
                <h1 class="invoice-title">Invoice #${data.id}</h1>
                <p class="date txt-small">Due: ${customFormat(new Date(data.dueDate))}</p>
            </div>
        </div>

        <div class="grid-container background">
            <div>
                <h2 class="section-title">From:</h2>
                <div class="padding">
                <p class="txt-small">${data.user.fullName}</p>
                <p class="txt-small">UTR: ${data.user.utrNumber}</p>
                <p class="txt-small">NIN: ${data.user.ninNumber}</p>
                <p class="txt-small">${data.user.emailAddress}</p>
                <p class="txt-small">${data.user.phoneNumber}</p>
                </div>
            </div>
            <div>
                <h2 class="section-title">To:</h2>
                <div class="padding">
                <p class="txt-small">${data.customer.name}</p>
                <p class="txt-small">${data.customer.emailAddress}</p>
                <p class="txt-small">${data.customer.phoneNumber}</p>
                </div>
            </div>
        </div>

        <table>
            <thead class="underline">
                <tr>
                    <th>Item</th>
                    <th class="align">Price</th>
                </tr>
            </thead>
            <tbody>
                ${data.workItems
            .map(
                (item, index) => `
                    <tr key=${index}>
                        <td class="bold" >${item.date}</td>
                        <tr class="underline">
                            <td class="padding">${item.descriptionOfWork}</td>
                            <td class="align">${getCurrencySymbol(data.currency)}${item.unitPrice.toFixed(2)}</td>
                        </tr>
                    </tr>
                `
            )
            .join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td>Subtotal:</td>
                    <td class="align">${getCurrencySymbol(data.currency)}${subtotal.toFixed(2)}</td>
                </tr>
                  <tr>
                ${data.payments.map(
                (payment, index) => `
                        <tr key=${index}>
                            <td>Payment:</td>
                            <tr>
                            <td class="padding normal">${payment.paymentDate}</td>
                            <td class="align">${getCurrencySymbol(data.currency)}${payment.amountPaid.toFixed(2)}</td>
                            </tr>
                        </tr>
                    `
            ).join('')}
                </tr>
                <tr>
                    <td>Tax (${data.taxRate}%):</td>
                    <td class="align">${getCurrencySymbol(data.currency)}${tax.toFixed(2)}</td>
                </tr>

                <tr>
                    <td>Total:</td>
                    <td class="align">${getCurrencySymbol(data.currency)}${total.toFixed(2)}</td>
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
            <div class="padding">
            <p class="txt-small">Bank Name: ${data.bankDetails.bankName}</p>
            <p class="txt-small">Account Name: ${data.bankDetails.accountName}</p>
            <p class="txt-small">Account Number: ${data.bankDetails.accountNumber}</p>
            <p class="txt-small">Sort Code: ${data.bankDetails.sortCode}</p>
            </div>
        </div>
    </div>

</body>
</html>
  `;
};