export const en = {
  // General
  actions: 'Actions',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  save: 'Save',
  new: 'New',
  search: 'Search',
  close: 'Close',
  
  // Sidebar
  sidebar: {
    dashboard: 'Dashboard',
    loans: 'Loans',
    payments: 'Payments',
    borrowers: 'Borrowers',
    settings: 'Settings',
  },

  // Header Dropdown
  header: {
    myAccount: 'My Account',
    settings: 'Settings',
    support: 'Support',
    logout: 'Logout',
    language: 'Language',
  },

  // Login Page
  loginPage: {
    title: 'LendEasy PH',
    subtitle: 'Enter your credentials to access the admin dashboard',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    signInButton: 'Sign In',
  },

  // Toasts / Notifications
  toast: {
    loginFailedTitle: 'Login Failed',
    loginFailedDescription: 'Invalid email or password. Please try again.',
    success: 'Success',
    error: 'Error',
    loanCreated: 'Loan application submitted successfully.',
    loanUpdated: 'Loan updated successfully.',
    customerSaved: 'Customer saved successfully.',
    customerUpdated: 'Customer updated successfully.',
    customerCreated: 'Customer created successfully.',
    customerDeleted: 'Customer and all associated loans have been deleted.',
    loanStatusUpdated: 'Loan status updated to {status}.',
    loanDeleted: 'Loan has been deleted.',
    paymentMarkedAsPaid: 'Payment for month {month} marked as paid.',
    principalPaymentRecorded: 'Principal payment recorded successfully.',
    remindersSent: 'Successfully sent {count} payment reminder(s).',
    noRemindersSent: 'No payments are due in 3 days. No reminders sent.',
  },

  // Dashboard Page
  dashboard: {
    title: 'Dashboard',
    totalLoanedKhr: 'Total Loaned (KHR)',
    totalLoanedUsd: 'Total Loaned (USD)',
    totalBorrowers: 'Total Borrowers',
    avgInterestRate: 'Avg. Interest Rate',
    potentialInterestKhr: 'Potential Interest (KHR)',
    potentialInterestUsd: 'Potential Interest (USD)',
    totalAmountDisbursedKhr: 'Total amount disbursed in KHR',
    totalAmountDisbursedUsd: 'Total amount disbursed in USD',
    totalUniqueCustomers: 'Total number of unique customers',
    avgInterestRateDesc: 'Average interest rate across all loans',
    potentialInterestKhrDesc: 'Potential interest from KHR loans',
    potentialInterestUsdDesc: 'Potential interest from USD loans',
    monthlyLoanOverview: 'Monthly Loan Overview',
    monthlyLoanOverviewDesc: 'Total loan amounts disbursed over the last 12 months.',
    customerList: 'Customer List',
    customerListDesc: 'A list of all customers and their loan summaries.',
  },

  // Loans Page
  loansPage: {
    title: 'Loans',
    newLoan: 'New Loan',
    loanApplications: 'Loan Applications',
    loanApplicationsDesc: 'A list of all loan applications.',
    searchPlaceholder: 'Search by borrower name...',
    table: {
      borrower: 'Borrower',
      principal: 'Principal',
      interest: 'Interest',
      term: 'Term',
      date: 'Date',
      status: 'Status',
    },
    actions: {
      viewPayments: 'View Payments',
      makePrincipalPayment: 'Make Principal Payment',
      editLoan: 'Edit Loan',
      deleteLoan: 'Delete Loan',
      changeStatus: 'Change Status',
      approve: 'Approve',
      reject: 'Reject',
      setAsPending: 'Set as Pending',
    }
  },
  
  // Payments Page
  paymentsPage: {
    title: 'Payments',
    sendReminders: 'Send Payment Reminders',
    paymentOverview: 'Payment Overview',
    paymentOverviewDesc: 'An overview of monthly payments for all active loans.',
    table: {
      borrower: 'Borrower',
      paymentProgress: 'Payment Progress',
      monthlyInterest: 'Monthly Interest',
      totalInterest: 'Total Interest',
    },
    paid: 'paid',
    noSchedule: 'No schedule generated',
    viewSchedule: 'View Payment Schedule'
  },
  
  // Borrowers Page
  borrowersPage: {
    title: 'Borrowers',
    newCustomer: 'New Customer',
    borrowerList: 'Borrower List',
    borrowerListDesc: 'A list of all borrowers and their loan summaries.',
    searchPlaceholder: 'Search by customer name...',
    table: {
      customer: 'Customer',
      phone: 'Phone / WhatsApp',
      telegramId: 'Telegram ID',
      idCardNumber: 'ID Card #',
      address: 'Address',
      totalLoans: 'Total Loans',
      totalLoanedAmount: 'Total Loaned Amount',
    },
     actions: {
      editCustomer: 'Edit Customer',
      deleteCustomer: 'Delete Customer',
    }
  },
  
  // Settings Page
  settingsPage: {
    title: 'Settings',
    profile: 'Profile',
    profileDesc: 'This is how others will see you on the site.',
    avatarLabel: 'Avatar URL or Upload',
    upload: 'Upload',
    fullNameLabel: 'Full Name',
    emailAddressLabel: 'Email Address',
    saveChanges: 'Save Changes',
  },

  // Generic Dialogs
  deleteDialog: {
      title: 'Are you absolutely sure?',
      customerDesc: 'This action cannot be undone. This will permanently delete the customer {name} and all of their associated loan records.',
      loanDesc: 'This action cannot be undone. This will permanently delete the loan record for {name}.'
  },

  // Forms
  customerForm: {
      newTitle: 'New Customer',
      editTitle: 'Edit Customer',
      newDesc: 'Fill in the details below to create a new customer.',
      editDesc: 'Update the details for this customer.',
      nameLabel: 'Customer Name',
      namePlaceholder: 'Juan dela Cruz',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'e.g. +639171234567 (include country code)',
      telegramLabel: 'Telegram Username (Optional)',
      telegramPlaceholder: 'e.g. juandelacruz',
      facebookLabel: 'Facebook Profile URL (Optional)',
      facebookPlaceholder: 'https://facebook.com/username',
      idCardLabel: 'ID Card Number',
      idCardPlaceholder: '1234-5678-9012',
      addressLabel: 'Address',
      addressPlaceholder: '123 Rizal St, Manila',
      profilePicLabel: 'Profile Picture',
      avatarUrlLabel: 'URL or Upload',
      avatarUrlPlaceholder: 'https://example.com/avatar.png',
  },
  loanForm: {
    newTitle: 'New Loan',
    newDesc: 'Fill in the details below to create a new loan for an existing customer.',
    borrowerNameLabel: 'Borrower Name',
    borrowerNamePlaceholder: 'Select an existing customer',
    noCustomers: 'Please add a customer first.',
    amountLabel: 'Amount',
    amountPlaceholder: '50000',
    currencyLabel: 'Currency',
    currencyPlaceholder: 'Select currency',
    interestRateLabel: 'Interest Rate (%)',
    interestRatePlaceholder: '5.5',
    termLabel: 'Term (Months)',
    termPlaceholder: '36',
    loanDateLabel: 'Loan Date',
    addressLabel: 'Address',
    addressPlaceholder: 'Address is auto-filled from customer',
    editTitle: 'Edit Loan',
    editDesc: 'Update the details for this loan. Customer name and address cannot be changed.',
  },
  principalPaymentForm: {
    title: 'Make Principal Payment',
    desc: 'Record a payment towards the principal amount for {name}. The current remaining principal is {amount}.',
    paymentAmountLabel: 'Payment Amount',
    paymentAmountPlaceholder: 'Enter amount',
    recordPaymentButton: 'Record Payment',
    summaryTitle: 'Payment Summary',
    summaryDesc: 'A payment of {paymentAmount} will be recorded. The new remaining principal will be {newPrincipal}. Future interest payments will be recalculated.',
    overpaymentTitle: 'Overpayment',
    overpaymentDesc: 'The payment amount cannot exceed the remaining principal.',
  },
  paymentScheduleDialog: {
    title: 'Monthly Payment Schedule',
    desc: 'For a loan of {amount} over {term} months at {interestRate}% interest. The borrower pays a fixed interest of {monthlyInterest} each month. The full principal amount is due with the final payment.',
    noSchedule: 'This loan has not been approved yet. A payment schedule will be generated upon approval.',
    exportToExcel: 'Export to Excel',
    markAsPaid: 'Mark as Paid',
    table: {
      month: 'Month',
      dueDate: 'Due Date',
      status: 'Status',
      principal: 'Principal',
      interest: 'Interest',
      totalPayment: 'Total Payment',
      remainingBalance: 'Remaining Balance',
      action: 'Action',
    }
  },
  verificationResultDialog: {
    title: 'AI Verification Complete',
    desc: 'The loan application has been automatically analyzed. Here are the findings.',
    issuesFound: 'Potential Issues Found',
    noIssuesFound: 'No Issues Found',
    flagsRaised: 'Flags Raised:'
  }
};
