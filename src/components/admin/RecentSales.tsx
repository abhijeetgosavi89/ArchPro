import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function RecentSales({ users }: { users: any[] }) {
    if (!users || users.length === 0) {
        return <p className="text-sm text-muted-foreground">No recent users found.</p>;
    }

    return (
        <div className="space-y-6">
            {users.map((user) => (
                <div key={user.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        {/* <AvatarImage src={user.image} alt="Avatar" /> */}
                        <AvatarFallback>{user.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}
