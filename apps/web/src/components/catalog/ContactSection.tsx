'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, MessageCircle, Instagram, Facebook, Globe, ExternalLink } from 'lucide-react';
import { Catalog } from '@/types';
import { formatWhatsAppUrl, formatInstagramUrl, formatFacebookUrl } from '@/lib/utils';

interface ContactSectionProps {
  catalog: Catalog;
}

export function ContactSection({ catalog }: ContactSectionProps) {
  const hasContact = catalog.whatsapp || catalog.phone || catalog.email || catalog.address;
  const hasSocials = catalog.instagram || catalog.facebook || catalog.website;

  if (!hasContact && !hasSocials) return null;

  return (
    <section className="py-16 px-6 md:px-12 bg-gray-950 text-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">Entre em contato</h2>
          <p className="text-white/50 text-base mb-10">Estamos prontos para atender você</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* WhatsApp - destaque */}
          {catalog.whatsapp && (
            <motion.a
              href={formatWhatsAppUrl(catalog.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-4 p-5 bg-green-500 rounded-3xl group"
            >
              <div className="p-3 bg-white/20 rounded-2xl">
                <MessageCircle size={28} className="text-white" />
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-wider mb-0.5">WhatsApp</p>
                <p className="text-white font-display font-bold text-xl">{catalog.whatsapp}</p>
              </div>
              <ExternalLink size={18} className="text-white/50 ml-auto group-hover:text-white transition-colors" />
            </motion.a>
          )}

          {/* Contatos secundários */}
          <div className="space-y-3">
            {catalog.phone && !catalog.whatsapp && (
              <a href={`tel:${catalog.phone}`} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Phone size={20} className="text-primary-400" />
                <span className="text-white/80 group-hover:text-white transition-colors">{catalog.phone}</span>
              </a>
            )}
            {catalog.email && (
              <a href={`mailto:${catalog.email}`} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors group">
                <Mail size={20} className="text-primary-400" />
                <span className="text-white/80 group-hover:text-white transition-colors">{catalog.email}</span>
              </a>
            )}
            {catalog.address && (
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-2xl">
                <MapPin size={20} className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span className="text-white/60 text-sm leading-relaxed">{catalog.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Redes sociais */}
        {hasSocials && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap gap-3 mt-8 pt-8 border-t border-white/10"
          >
            {catalog.instagram && (
              <a href={formatInstagramUrl(catalog.instagram)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <Instagram size={16} /> Instagram
              </a>
            )}
            {catalog.facebook && (
              <a href={formatFacebookUrl(catalog.facebook)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 rounded-2xl text-white text-sm font-medium hover:opacity-90 transition-opacity">
                <Facebook size={16} /> Facebook
              </a>
            )}
            {catalog.website && (
              <a href={catalog.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-white text-sm font-medium hover:bg-white/20 transition-colors">
                <Globe size={16} /> Website
              </a>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
}
