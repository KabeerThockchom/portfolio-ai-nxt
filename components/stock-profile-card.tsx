import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Globe, MapPin } from "lucide-react";

interface StockProfileCardProps {
  profileData: any;
  symbol: string;
}

export default function StockProfileCard({ profileData, symbol }: StockProfileCardProps) {
  if (!profileData || !profileData.summaryProfile) {
    return (
      <Card className="border-border">
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No profile data available for {symbol}</p>
        </CardContent>
      </Card>
    );
  }

  const profile = profileData.summaryProfile;
  const companySymbol = profileData.symbol || symbol;

  const companyName = companySymbol;
  const description = profile.longBusinessSummary || "No description available";
  const sector = profile.sector || profile.sectorDisp || "N/A";
  const industry = profile.industry || profile.industryDisp || "N/A";
  const website = profile.website || "";
  const employees = profile.fullTimeEmployees;
  const city = profile.city || "";
  const state = profile.state || "";
  const country = profile.country || "";
  const ceo = profile.companyOfficers?.[0]?.name || (profile.executiveTeam?.[0]?.name || "N/A");

  const location = [city, state, country].filter(Boolean).join(", ");

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{companyName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Company Profile</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Industry & Sector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Sector</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{sector}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Industry</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{industry}</p>
          </div>
        </div>

        {/* Location & Employees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {location && (
            <div className="p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Location</p>
              </div>
              <p className="text-sm font-semibold">{location}</p>
            </div>
          )}
          {employees && (
            <div className="p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs font-medium text-muted-foreground">Employees</p>
              </div>
              <p className="text-sm font-semibold">{employees.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* CEO */}
        {ceo !== "N/A" && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <p className="text-xs font-medium text-muted-foreground mb-1">CEO</p>
            <p className="text-sm font-semibold">{ceo}</p>
          </div>
        )}

        {/* Website */}
        {website && (
          <div className="p-3 bg-muted rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs font-medium text-muted-foreground">Website</p>
            </div>
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {website.replace(/^https?:\/\//, '')}
            </a>
          </div>
        )}

        {/* Description */}
        <div className="p-4 bg-muted rounded-lg border border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">About</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
