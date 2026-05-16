import { getAccounts } from "@/lib/account-actions";
import AccountsClient from "./accounts-client";

export default async function AccountsManagementPage() {
  const accounts = await getAccounts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tài khoản</h2>
          <p className="text-sm text-muted-foreground mt-1">Phân quyền và quản lý nhân viên</p>
        </div>
      </div>

      <AccountsClient initialAccounts={accounts} />
    </div>
  );
}
