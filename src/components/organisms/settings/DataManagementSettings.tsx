import React, { useRef } from 'react';
import { Database, Download, Upload, Trash2 } from 'lucide-react';
import { exportData, importData, resetData, clearTransactions } from '@/services/backupService';
import { useAuth } from '@/context/AuthContext';
import { CollapsibleSection } from '@/components/molecules/CollapsibleSection';

interface Props {
    isOpen: boolean;
    onToggle: () => void;
}

export const DataManagementSettings = ({ isOpen, onToggle }: Props) => {
    const { user } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const jsonString = exportData();
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cuadra-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                const success = importData(content);
                if (success) {
                    alert('Datos restaurados correctamente. La aplicación se reiniciará.');
                    window.location.reload();
                } else {
                    alert('Error al restaurar los datos. El archivo podría estar corrupto.');
                }
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleReset = () => {
        if (confirm('⚠️ ¿Estás SEGURO de que quieres borrar todos los datos de la aplicación?\n\nEsta acción no se puede deshacer.')) {
            if (confirm('¿De verdad? Se borrarán todas las tarjetas, préstamos e historial.')) {
                resetData();
                window.location.reload();
            }
        }
    };

    const handleClearHistory = async () => {
        if (confirm('⚠️ ¿Borrar TODO el historial de pagos desde el inicio?')) {
            if (confirm('Esta acción no se puede deshacer. Tus estadísticas históricas se perderán.')) {
                try {
                    await clearTransactions(false);
                    alert('Historial histórico borrado.');
                    window.location.reload();
                } catch (e) {
                    alert('Error al borrar.');
                }
            }
        }
    };

    const handleResetMonth = async () => {
        if (confirm('¿Reiniciar los pagos de ESTE MES?')) {
            try {
                await clearTransactions(true);
                alert('Pagos del mes reiniciados. Tus gastos ahora aparecerán como pendientes.');
                window.location.reload();
            } catch (e) {
                alert('Error al reiniciar el mes.');
            }
        }
    };

    return (
        <CollapsibleSection
            title="Gestión de Datos Locales"
            description="Copia de seguridad y restauración"
            icon={Database}
            isOpen={isOpen}
            onToggle={onToggle}
            colorClass="text-blue-600 bg-blue-50"
        >
            <div className="space-y-4">
                <button
                    onClick={handleExport}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Download className="text-slate-400 group-hover:text-blue-600" size={20} />
                        <div>
                            <p className="font-bold text-slate-700">Descargar copia de seguridad</p>
                            <p className="text-xs text-slate-400">Guarda tus datos en un archivo JSON</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handleImportClick}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <Upload className="text-slate-400 group-hover:text-emerald-600" size={20} />
                        <div>
                            <p className="font-bold text-slate-700">Restaurar copia de seguridad</p>
                            <p className="text-xs text-slate-400">Importa datos desde un archivo JSON</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".json"
                        className="hidden"
                    />
                </button>

                <button
                    onClick={handleResetMonth}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50 hover:bg-amber-100 text-left transition-colors group mt-4"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 className="text-amber-500 group-hover:text-amber-600" size={20} />
                        <div>
                            <p className="font-bold text-amber-700">Reiniciar Mes Actual</p>
                            <p className="text-xs text-amber-600">Borra pagos solo de este periodo</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handleClearHistory}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-orange-100 bg-orange-50 hover:bg-orange-100 text-left transition-colors group mt-4"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 className="text-orange-400 group-hover:text-orange-600" size={20} />
                        <div>
                            <p className="font-bold text-orange-700">Borrar Historial de Pagos</p>
                            <p className="text-xs text-orange-500">Elimina solo las transacciones pasadas</p>
                        </div>
                    </div>
                </button>

                <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 text-left transition-colors group mt-4"
                >
                    <div className="flex items-center gap-3">
                        <Trash2 className="text-red-400 group-hover:text-red-600" size={20} />
                        <div>
                            <p className="font-bold text-red-700">Borrar todos los datos</p>
                            <p className="text-xs text-red-500">Elimina tarjetas, préstamos y toda la info</p>
                        </div>
                    </div>
                </button>
            </div>

            <div className="text-center text-xs text-slate-400 pt-8">
                <p>Cuadra WebApp v0.2.0 (Cloud Enabled)</p>
                <p>Datos almacenados en {user ? 'Supabase Cloud ☁️' : 'Local Device 📱'}</p>
            </div>
        </CollapsibleSection>
    );
};
