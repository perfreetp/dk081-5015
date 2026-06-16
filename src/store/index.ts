import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import Taro from '@tarojs/taro';
import { Product, Conversation, Message, Review, TransferRecord, User } from '@/types';
import { mockProducts } from '@/data/mockProducts';
import { mockConversations, mockMessages } from '@/data/mockMessages';

interface AppState {
  currentUser: User;
  products: Product[];
  conversations: Conversation[];
  messages: Message[];

  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  getProductById: (id: string) => Product | undefined;
  getUserProducts: (userId: string) => Product[];

  addConversation: (conversation: Conversation) => void;
  updateConversation: (id: string, updates: Partial<Conversation>) => void;
  getConversationById: (id: string) => Conversation | undefined;
  getUserConversations: (userId: string) => Conversation[];

  addMessage: (message: Message) => void;
  getMessagesByConversation: (conversationId: string) => Message[];

  addTransferRecord: (productId: string, record: TransferRecord) => void;
  transferOwnership: (productId: string, record: TransferRecord) => void;
  addReview: (productId: string, review: Review) => void;

  resetStore: () => void;
}

const initialUser: User = {
  id: 'user_001',
  name: '新手妈妈小李',
  avatar: '',
  intro: '宝宝8个月 · 注重卫生的处女座妈妈',
  trustLevel: 'expert',
  joinDate: '2024-01-15'
};

const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: initialUser,
      products: mockProducts,
      conversations: mockConversations,
      messages: mockMessages,

      addProduct: (product) => set((state) => ({
        products: [product, ...state.products]
      })),

      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p =>
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      getProductById: (id) => get().products.find(p => p.id === id),

      getUserProducts: (userId) => get().products.filter(p => p.sellerId === userId),

      addConversation: (conversation) => set((state) => ({
        conversations: [conversation, ...state.conversations]
      })),

      updateConversation: (id, updates) => set((state) => ({
        conversations: state.conversations.map(c =>
          c.id === id ? { ...c, ...updates } : c
        )
      })),

      getConversationById: (id) => get().conversations.find(c => c.id === id),

      getUserConversations: (userId) => get().conversations.filter(c =>
        c.buyerId === userId || c.sellerId === userId
      ),

      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message]
      })),

      getMessagesByConversation: (conversationId) =>
        get().messages.filter(m => m.conversationId === conversationId),

      addTransferRecord: (productId, record) => set((state) => ({
        products: state.products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              transferRecords: [...p.transferRecords, record]
            };
          }
          return p;
        })
      })),

      transferOwnership: (productId, record) => set((state) => ({
        products: state.products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              transferRecords: [...p.transferRecords, record],
              currentHolderId: record.toUserId,
              currentHolderName: record.toUser,
              status: 'sold' as const
            };
          }
          return p;
        })
      })),

      addReview: (productId, review) => set((state) => ({
        products: state.products.map(p => {
          if (p.id === productId) {
            return {
              ...p,
              reviews: [...p.reviews, review]
            };
          }
          return p;
        })
      })),

      resetStore: () => set({
        products: mockProducts,
        conversations: mockConversations,
        messages: mockMessages
      })
    }),
    {
      name: 'baby-resume-storage',
      storage: createJSONStorage(() => {
        if (process.env.TARO_ENV === 'h5') {
          return localStorage;
        }
        return {
          getItem: async (name: string) => {
            try {
              const res = await Taro.getStorageSync(name);
              return res;
            } catch (e) {
              return null;
            }
          },
          setItem: async (name: string, value: string) => {
            try {
              await Taro.setStorageSync(name, value);
            } catch (e) {
              console.error('[Store] setItem error:', e);
            }
          },
          removeItem: async (name: string) => {
            try {
              await Taro.removeStorageSync(name);
            } catch (e) {
              console.error('[Store] removeItem error:', e);
            }
          }
        } as any;
      }),
      partialize: (state) => ({
        products: state.products,
        conversations: state.conversations,
        messages: state.messages,
        currentUser: state.currentUser
      })
    }
  )
);

export default useStore;
