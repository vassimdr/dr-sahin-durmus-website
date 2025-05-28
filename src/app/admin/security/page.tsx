'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Eye,
  TrendingUp,
  Activity,
  Lock,
  Users,
  Clock
} from 'lucide-react';
import { auditLogger, AuditLogEntry, AuditEventType } from '@/lib/audit-log';

export default function SecurityDashboard() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEventType, setSelectedEventType] = useState<AuditEventType | 'ALL'>('ALL');

  useEffect(() => {
    loadSecurityData();
    
    // Auto refresh her 30 saniyede
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = () => {
    const allLogs = auditLogger.getLogs(200);
    const statistics = auditLogger.getStatistics();
    
    setLogs(allLogs);
    setStats(statistics);
    setLoading(false);
  };

  const handleExportLogs = (format: 'json' | 'csv') => {
    const data = auditLogger.exportLogs(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEventTypeIcon = (eventType: AuditEventType) => {
    switch (eventType) {
      case 'LOGIN_SUCCESS':
      case 'LOGIN_FAILED':
      case 'LOGIN_ATTEMPT':
        return <Lock className="h-4 w-4" />;
      case 'RATE_LIMIT_EXCEEDED':
        return <AlertTriangle className="h-4 w-4" />;
      case 'UNAUTHORIZED_ACCESS':
      case 'IP_BLOCKED':
        return <Shield className="h-4 w-4" />;
      case 'SESSION_EXPIRED':
      case 'LOGOUT':
        return <Clock className="h-4 w-4" />;
      case 'ADMIN_ACTION':
        return <Users className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredLogs = selectedEventType === 'ALL' 
    ? logs 
    : logs.filter(log => log.eventType === selectedEventType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Güvenlik verileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Güvenlik Dashboard</h1>
          <p className="text-gray-600">Sistem güvenlik olayları ve istatistikleri</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadSecurityData}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Yenile
          </Button>
          <Button 
            onClick={() => handleExportLogs('json')}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            JSON
          </Button>
          <Button 
            onClick={() => handleExportLogs('csv')}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Log</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Son 24 saat: {stats?.last24h || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-red-600">{stats?.bySeverity?.critical || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Son saat: {logs.filter(l => l.severity === 'critical' && l.timestamp > Date.now() - 3600000).length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique IPs</p>
                <p className="text-2xl font-bold">{stats?.uniqueIPs || 0}</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Unique Devices: {stats?.uniqueDevices || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Son Saat</p>
                <p className="text-2xl font-bold">{stats?.lastHour || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Activity rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Event Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Güvenlik Olayları
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button 
              onClick={() => setSelectedEventType('ALL')}
              variant={selectedEventType === 'ALL' ? 'default' : 'outline'}
              size="sm"
            >
              Tümü ({logs.length})
            </Button>
            {Object.entries(stats?.byType || {}).map(([eventType, count]) => (
              <Button
                key={eventType}
                onClick={() => setSelectedEventType(eventType as AuditEventType)}
                variant={selectedEventType === eventType ? 'default' : 'outline'}
                size="sm"
              >
                {eventType.replace(/_/g, ' ')} ({count as number})
              </Button>
            ))}
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Zaman</th>
                  <th className="text-left p-2">Event</th>
                  <th className="text-left p-2">Severity</th>
                  <th className="text-left p-2">Device ID</th>
                  <th className="text-left p-2">IP</th>
                  <th className="text-left p-2">Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <div className="text-xs text-gray-600">
                        {new Date(log.timestamp).toLocaleString('tr-TR')}
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        {getEventTypeIcon(log.eventType)}
                        <span className="text-xs font-medium">
                          {log.eventType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      <Badge className={`text-xs ${getSeverityColor(log.severity)}`}>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <span className="text-xs font-mono">
                        {log.deviceId.substring(0, 8)}...
                      </span>
                    </td>
                    <td className="p-2">
                      <span className="text-xs">{log.ipAddress}</span>
                    </td>
                    <td className="p-2">
                      <div className="text-xs text-gray-600 max-w-xs truncate">
                        {JSON.stringify(log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Seçilen kriterlere uygun log bulunamadı
            </div>
          )}

          {filteredLogs.length > 50 && (
            <div className="text-center mt-4 text-sm text-gray-600">
              {filteredLogs.length - 50} daha fazla log var. Daha fazla görmek için filtreleri kullanın.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 