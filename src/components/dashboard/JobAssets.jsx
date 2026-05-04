import React from 'react';
import { Box, Wrench, Battery, Zap, FileText } from 'lucide-react';

const JobAssets = ({ assets }) => {
    if (!assets || assets.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                Associated Assets
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assets.map((item, idx) => {
                    const asset = item.asset;
                    const batteryType = asset.custom_fields?.find(f => f.label === 'Battery Type')?.value;
                    const batteryMake = asset.custom_fields?.find(f => f.label === 'Battery Manufacturer')?.value;
                    const notes = asset.custom_fields?.find(f => f.label === 'Notes/Comments')?.value;

                    return (
                        <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            {/* Asset Image */}
                            <div className="h-48 bg-slate-100 relative">
                                {asset.asset_image ? (
                                    <img
                                        src={asset.asset_image}
                                        alt={asset.asset_name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-400">
                                        <Box className="w-12 h-12 opacity-20" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-4">
                                <div>
                                    <h4 className="font-bold text-slate-800">{asset.asset_name}</h4>
                                    <p className="text-sm text-slate-500 font-mono mt-1">SN: {asset.asset_serial_number || 'N/A'}</p>
                                </div>

                                {/* Key Specs */}
                                <div className="space-y-2">
                                    {(batteryType || batteryMake) && (
                                        <div className="flex items-start gap-2 text-sm text-slate-600 bg-yellow-50 p-2 rounded">
                                            <Battery className="w-4 h-4 text-yellow-600 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="block font-medium text-slate-800">Battery</span>
                                                {batteryType && <span className="block text-xs">{batteryType}</span>}
                                                {batteryMake && <span className="block text-xs text-slate-500">{batteryMake}</span>}
                                            </div>
                                        </div>
                                    )}

                                    {notes && (
                                        <div className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                            <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                                            <p className="text-xs italic">"{notes}"</p>
                                        </div>
                                    )}
                                </div>

                                {/* Full Attributes */}
                                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                                    {asset.custom_fields?.filter(f => f.value && !['Battery Type', 'Battery Manufacturer', 'Notes/Comments'].includes(f.label)).slice(0, 4).map((field, i) => (
                                        <div key={i}>
                                            <span className="text-[10px] uppercase text-slate-400 font-bold block truncate">{field.label}</span>
                                            <span className="text-xs text-slate-700 truncate block" title={field.value}>{field.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default JobAssets;
