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
  ArrowLeft
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CallbackRequest {
  id: number;
  name: string;
  phone: string;
  status: 'pending' | 'called' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  called_at?: string;
}

export default function CallbackRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CallbackRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingRequest, setEditingRequest] = useState<CallbackRequest | null>(null);
  const [editNotes, setEditNotes] = useState('');

  // Verileri yükle
  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/callback-requests?status=${filterStatus}&limit=100`);
      
      if (response.ok) {
        const result = await response.json();
        setRequests(result.data || []);
      } else {
        console.error('Failed to load callback requests');
      }
    } catch (error) {
      console.error('Error loading callback requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [filterStatus]);

  // Durum güncelle
  const updateStatus = async (id: number, status: string, notes?: string) => {
    try {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes })
      });

      if (response.ok) {
        await loadRequests();
        setEditingRequest(null);
        setEditNotes('');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Sil
  const deleteRequest = async (id: number) => {
    if (!confirm('Bu talebi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`/api/callback-requests/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadRequests();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  // Filtreleme
  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.phone.includes(searchTerm);
    return matchesSearch;
  });

  // Durum badge'i
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Bekliyor', color: 'bg-yellow-100 text-yellow-800' },
      called: { label: 'Arandı', color: 'bg-blue-100 text-blue-800' },
      completed: { label: 'Tamamlandı', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'İptal', color: 'bg-red-100 text-red-800' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  // Tarih formatla
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // İstatistikler
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    called: requests.filter(r => r.status === 'called').length,
    completed: requests.filter(r => r.status === 'completed').length
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Panel
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Geri Arama Talepleri</h1>
            <p className="text-slate-600 mt-1">Müşteri geri arama taleplerini yönetin</p>
          </div>
        </div>
        <Button
          onClick={loadRequests}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Yenile
        </Button>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Toplam Talep</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <Phone className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Bekleyen</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Arandı</p>
                <p className="text-2xl font-bold text-blue-600">{stats.called}</p>
              </div>
              <PhoneCall className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Tamamlandı</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Arama</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="İsim veya telefon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekleyen</option>
                <option value="called">Arandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                variant="outline"
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Talep Listesi */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-slate-600">Talepler yükleniyor...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Phone className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Talep Bulunamadı</h3>
              <p className="text-slate-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Arama kriterlerinize uygun talep bulunamadı.'
                  : 'Henüz geri arama talebi bulunmuyor.'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">{request.name}</span>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="w-4 h-4 text-slate-600" />
                      <a 
                        href={`tel:${request.phone}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {request.phone}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">
                        {formatDate(request.created_at)}
                      </span>
                      {request.called_at && (
                        <span className="text-sm text-slate-500">
                          • Arandı: {formatDate(request.called_at)}
                        </span>
                      )}
                    </div>

                    {request.notes && (
                      <div className="bg-slate-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-medium text-slate-700">Notlar:</span>
                        </div>
                        <p className="text-sm text-slate-600">{request.notes}</p>
                      </div>
                    )}

                    {editingRequest?.id === request.id && (
                      <div className="mt-3 space-y-3">
                        <Textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Not ekleyin..."
                          className="min-h-[80px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateStatus(request.id, request.status, editNotes)}
                          >
                            Kaydet
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingRequest(null);
                              setEditNotes('');
                            }}
                          >
                            İptal
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(request.id, 'called')}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1"
                      >
                        <PhoneCall className="w-3 w-3" />
                        Arandı
                      </Button>
                    )}

                    {request.status === 'called' && (
                      <Button
                        size="sm"
                        onClick={() => updateStatus(request.id, 'completed')}
                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3 w-3" />
                        Tamamla
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingRequest(request);
                        setEditNotes(request.notes || '');
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit className="w-3 w-3" />
                      Not
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStatus(request.id, 'cancelled')}
                      className="text-orange-600 hover:text-orange-700 border-orange-300 hover:border-orange-400 flex items-center gap-1"
                    >
                      <X className="w-3 w-3" />
                      İptal
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteRequest(request.id)}
                      className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 flex items-center gap-1"
                    >
                      <Trash2 className="w-3 w-3" />
                      Sil
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
} 