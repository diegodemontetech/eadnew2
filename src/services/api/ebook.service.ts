import { supabase } from './config';
import { handleError, handleResponse } from './config';
import type { Ebook } from '../../types';

export const ebookService = {
  async getAllEbooks() {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return handleResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  async getEbookById(id: string) {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .select(`
          *,
          category:categories(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return handleResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  async createEbook(ebookData: Partial<Ebook>) {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .insert([ebookData])
        .select()
        .single();

      if (error) throw error;
      return handleResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  async updateEbook(id: string, ebookData: Partial<Ebook>) {
    try {
      const { data, error } = await supabase
        .from('ebooks')
        .update(ebookData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return handleResponse(data);
    } catch (error) {
      return handleError(error);
    }
  },

  async deleteEbook(id: string) {
    try {
      const { error } = await supabase
        .from('ebooks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      return handleError(error);
    }
  },

  async updateReadingProgress(ebookId: string, currentPage: number, completed: boolean = false) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('ebook_progress')
        .upsert({
          user_id: user.id,
          ebook_id: ebookId,
          current_page: currentPage,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      return handleResponse(data);
    } catch (error) {
      return handleError(error);
    }
  }
};