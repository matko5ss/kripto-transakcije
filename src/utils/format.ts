// Funkcija za formatiranje iznosa u kriptovaluti
export function formatAmount(amount: string | number, decimals: number = 8): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) {
    return '0';
  }
  
  return numAmount.toFixed(decimals);
}

// Funkcija za formatiranje datuma
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
      return 'Neispravan datum';
    }
    
    return date.toLocaleDateString('hr-HR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch (error) {
    console.error('Greška pri formatiranju datuma:', error);
    return 'Neispravan datum';
  }
}

// Funkcija za skraćivanje hash-a
export function formatHash(hash: string, length: number = 8): string {
  if (!hash || hash.length < length * 2) {
    return hash || '';
  }
  
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
}

// Funkcija za formatiranje veličine (B, KB, MB, GB)
export function formatSize(bytes: string | number): string {
  const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  
  if (isNaN(numBytes)) {
    return '0 B';
  }
  
  if (numBytes < 1024) {
    return `${numBytes.toFixed(2)} B`;
  } else if (numBytes < 1024 * 1024) {
    return `${(numBytes / 1024).toFixed(2)} KB`;
  } else if (numBytes < 1024 * 1024 * 1024) {
    return `${(numBytes / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

// Funkcija za formatiranje starosti (sekunde, minute, sati, dani)
export function formatAge(seconds: string | number): string {
  const numSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
  
  if (isNaN(numSeconds)) {
    return 'Nepoznato';
  }
  
  if (numSeconds < 60) {
    return `${numSeconds} sek`;
  } else if (numSeconds < 3600) {
    return `${Math.floor(numSeconds / 60)} min`;
  } else if (numSeconds < 86400) {
    return `${Math.floor(numSeconds / 3600)} h`;
  } else {
    return `${Math.floor(numSeconds / 86400)} d`;
  }
}
