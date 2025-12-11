import React, { useEffect, useState } from 'react';
import api from '../lib/axios';
import useThemeStore from '../store/useThemeStore';
import { Plus, Trash2, CheckCircle, Circle, ShoppingBag } from 'lucide-react';

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [qty, setQty] = useState('');
    const { theme } = useThemeStore();
    const isDarkMode = theme === 'dark';

    useEffect(() => {
        api.get('/shoppinglist')
            .then((res) => setItems(res.data.data.items || []))
            .catch(console.error);
    }, []);

    const addItem = async (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;
        const res = await api.post('/shoppinglist/add', { ingredient: newItem, quantity: qty || '1' });
        setItems(res.data.data.items);
        setNewItem('');
        setQty('');
    };

    const toggle = async (id) => {
        setItems((prev) => prev.map((i) => (i._id === id ? { ...i, isChecked: !i.isChecked } : i)));
        await api.patch(`/shoppinglist/${id}/toggle`);
    };

    const remove = async (id) => {
        setItems((prev) => prev.filter((i) => i._id !== id));
        await api.delete(`/shoppinglist/${id}`);
    };

    const cardBg = isDarkMode ? 'bg-[#1e1e1e] border-gray-700' : 'bg-white border-gray-200';
    const textColor = isDarkMode ? 'text-white' : 'text-gray-900';
    const inputBg = isDarkMode ? 'bg-transparent text-white' : 'bg-transparent text-gray-900';

    return (
        <div className="max-w-2xl mx-auto space-y-8 mb-10 font-dancing">
            <h1 className={`text-3xl font-bold flex items-center gap-3 ${textColor}`}>
                <ShoppingBag /> Shopping List
            </h1>

            <form onSubmit={addItem} className={`flex gap-2 p-2 rounded-xl shadow-sm border ${cardBg}`}>
                <input value={newItem} onChange={(e) => setNewItem(e.target.value)} placeholder="Add item..." className={`flex-1 px-4 py-2 focus:outline-none ${inputBg}`} />
                <input
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                    placeholder="Qty"
                    className={`w-24 px-4 py-2 border-l focus:outline-none ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} ${inputBg}`}
                />
                <button type="submit" className="p-2 bg-[#f97316] text-white rounded-lg">
                    <Plus />
                </button>
            </form>

            <div className={`rounded-xl shadow-sm border overflow-hidden divide-y ${cardBg} ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {items.map((item) => (
                    <div key={item._id} className={`flex items-center justify-between p-4 group ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggle(item._id)}>
                            <button className={item.isChecked ? 'text-green-500' : 'text-gray-300'}>{item.isChecked ? <CheckCircle /> : <Circle />}</button>
                            <div>
                                <p className={`font-medium ${item.isChecked ? 'text-gray-500 line-through' : textColor}`}>{item.ingredient}</p>
                                <p className="text-xs text-gray-500">{item.quantity}</p>
                            </div>
                        </div>
                        <button onClick={() => remove(item._id)} className="text-gray-400 hover:text-red-500">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ShoppingList;
