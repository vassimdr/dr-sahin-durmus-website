"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  User, 
  Calendar,
  Search,
  Filter,
  CheckCircle,
  Clock,
  X,
  Trash2,
  Edit,
  PhoneCall,
  MessageSquare,
  RefreshCw,
  ArrowLeft,
  Star,
  XCircle,
  AlertCircle,
  Users,
  TrendingUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface CallbackRequest {
  id: number;
  name: string;
  phone: string;
  status: 'pending' | 'called' | 'completed' | 'cancelled' | 'scheduled';
  priority: number;
  source: string;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  called_at?: string;
  scheduled_at?: string;
  completed_at?: string;
}

interface Stats {
  total: number;
  pending: number;
  called: number;
  completed: number;
  cancelled: number;
  scheduled: number;
  today_total: number;
  today_pending: number;
  high_priority: number;
  avg_response_hours: number;
}

const STATUS_CONFIG = {
  pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  called: { label: 'Arandı', color: 'bg-blue-100 text-blue-800', icon: Phone },
  completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'İptal', color: 'bg-red-100 text-red-800', icon: XCircle },
  scheduled: { label: 'Planlandı', color: 'bg-purple-100 text-purple-800', icon: Calendar }
};

const PRIORITY_CONFIG = {
  1: { label: 'Normal', color: 'text-gray-600', icon: '⚪' },
  2: { label: 'Önemli', color: 'text-yellow-600', icon: '🟡' },
  3: { label: 'Yüksek', color: 'text-orange-600', icon: '🟠' },
  4: { label: 'Acil', color: 'text-red-600', icon: '🔴' },
  5: { label: 'Kritik', color: 'text-red-800', icon: '🚨' }
};

const SOURCE_CONFIG = {
  website: { label: 'Website', color: 'bg-blue-50 text-blue-700' },
  phone: { label: 'Telefon', color: 'bg-green-50 text-green-700' },
  whatsapp: { label: 'WhatsApp', color: 'bg-green-50 text-green-700' },
  instagram: { label: 'Instagram', color: 'bg-pink-50 text-pink-700' },
  tiktok: { label: 'TikTok', color: 'bg-gray-50 text-gray-700' },
  social: { label: 'Diğer Sosyal Medya', color: 'bg-purple-50 text-purple-700' },
  referral: { label: 'Tavsiye', color: 'bg-orange-50 text-orange-700' }
};

export default function CallbackRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CallbackRequest>>({});
  
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    source: 'all',
    search: ''
  });
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.source !== 'all') params.append('source', filters.source);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/callback-requests?${params}`);
      const result = await response.json();

      if (result.success) {
        setRequests(result.data);
        setStats(result.stats);
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages
        }));
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, admin_notes: notes })
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const deleteRequest = async (id: number) => {
    if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchRequests();
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const startEdit = (request: CallbackRequest) => {
    setEditingId(request.id);
    setEditData({
      status: request.status,
      priority: request.priority,
      admin_notes: request.admin_notes || ''
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;

    try {
      const response = await fetch(`/api/callback-requests/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      });

      if (response.ok) {
        setEditingId(null);
        setEditData({});
        fetchRequests();
      }
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Geri Arama Talepleri</h1>
        <Button onClick={fetchRequests} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Toplam</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Bekliyor</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Arandı</p>
                  <p className="text-2xl font-bold">{stats.called}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Tamamlandı</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Yüksek Öncelik</p>
                  <p className="text-2xl font-bold">{stats.high_priority}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Ort. Yanıt (saat)</p>
                  <p className="text-2xl font-bold">{stats.avg_response_hours || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="İsim veya telefon ara..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label>Durum</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Öncelik</Label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.icon} {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Kaynak</Label>
              <Select value={filters.source} onValueChange={(value) => handleFilterChange('source', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(SOURCE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Talepler ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Yükleniyor...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Talep bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">{request.name}</h3>
                        <Badge className={STATUS_CONFIG[request.status].color}>
                          {STATUS_CONFIG[request.status].label}
                        </Badge>
                        <Badge variant="outline" className={PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG].color}>
                          {PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG].icon} {PRIORITY_CONFIG[request.priority as keyof typeof PRIORITY_CONFIG].label}
                        </Badge>
                        <Badge variant="outline" className={SOURCE_CONFIG[request.source as keyof typeof SOURCE_CONFIG]?.color}>
                          {SOURCE_CONFIG[request.source as keyof typeof SOURCE_CONFIG]?.label}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {request.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(request.created_at)}
                        </span>
                      </div>

                      {request.notes && (
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {request.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => startEdit(request)}
                        variant="outline"
                        size="sm"
                      >
                        Düzenle
                      </Button>
                      <Button
                        onClick={() => deleteRequest(request.id)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {editingId === request.id && (
                    <div className="border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Durum</Label>
                          <Select 
                            value={editData.status} 
                            onValueChange={(value) => setEditData(prev => ({ ...prev, status: value as any }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>{config.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Öncelik</Label>
                          <Select 
                            value={editData.priority?.toString()} 
                            onValueChange={(value) => setEditData(prev => ({ ...prev, priority: parseInt(value) }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  {config.icon} {config.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Admin Notları</Label>
                        <Textarea
                          value={editData.admin_notes || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, admin_notes: e.target.value }))}
                          placeholder="Admin notları..."
                          className="min-h-[80px]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={saveEdit} size="sm">
                          Kaydet
                        </Button>
                        <Button 
                          onClick={() => setEditingId(null)} 
                          variant="outline" 
                          size="sm"
                        >
                          İptal
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                variant="outline"
                size="sm"
              >
                Önceki
              </Button>
              
              <span className="flex items-center px-4 text-sm text-gray-600">
                {pagination.page} / {pagination.totalPages}
              </span>
              
              <Button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                variant="outline"
                size="sm"
              >
                Sonraki
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 