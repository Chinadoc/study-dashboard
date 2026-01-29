import { redirect } from 'next/navigation';

// Redirect legacy /inventory route to new /business/inventory
export default function InventoryRedirect() {
    redirect('/business/inventory');
}
