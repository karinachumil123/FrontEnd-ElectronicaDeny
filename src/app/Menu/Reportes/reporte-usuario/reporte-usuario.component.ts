import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import Swal from 'sweetalert2';
import { UsuarioService } from '../../../services/usuario.service';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { EmpresaService } from '../../../services/empresa.service';

@Component({
  selector: 'app-reporte-usuario',
  standalone: true,
  templateUrl: './reporte-usuario.component.html',
  styleUrl: './reporte-usuario.component.css',
  imports: [FormsModule, CommonModule]
})

export class ReporteUsuarioComponent implements OnInit {
  usuarios: any[] = [];
  originalUsuarios: any[] = [];

  empresa: any = {
    nombre: '',
    telefono: '',
    correo: '',
    direccion: ''
  };

  
  usuarioActual: any = null;

  // Datos para mostrar en el reporte
  reportMonth: string = '';
  reportDate: string = '';
  reportUser: string = '';

  // Filtros
  filtroUsuario: string = '';
  fechaInicio: string = '';
  fechaFin: string = '';

  // Paginación
  paginaActual: number = 1;
  elementosPorPagina: number = 10;

  constructor(
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private empresaService: EmpresaService
  ) {}

  ngOnInit(): void {
  this.cargarUsuarios();
  this.cargarEmpresa();
  this.obtenerUsuarioActual();  // Solo aquí llamamos a inicializarDatosReporte()
}

inicializarDatosReporte(): void {
  console.log('Usuario actual:', this.usuarioActual);

  const now = new Date();
  const year = now.getFullYear();

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const diaNombre = diasSemana[now.getDay()];
  const diaNumero = now.getDate();

  const horas = now.getHours().toString().padStart(2, '0');
  const minutos = now.getMinutes().toString().padStart(2, '0');

  this.reportDate = `${diaNombre} ${diaNumero} - Hora ${horas}:${minutos}`;

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  this.reportMonth = `${meses[now.getMonth()]} ${year}`;

  // Mostrar nombre y apellido del usuario logueado
  this.reportUser = this.usuarioActual 
  ? `${this.usuarioActual.name} ${this.usuarioActual.apellido}` 
  : 'Administrador';
}

limpiarFiltros(): void {
  this.filtroUsuario = '';
  this.fechaInicio = '';
  this.fechaFin = '';
  this.usuarios = [...this.originalUsuarios];
}


  cargarUsuarios(): void {
    this.usuarioService.obtenerUsuarios().subscribe({
      next: (data) => {
        this.originalUsuarios = data;
        this.usuarios = [...data];
        this.verificarPropiedadesUsuarios();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar usuarios',
          text: error.message || 'Hubo un problema al cargar los usuarios.'
        });
      }
    });
  }

  cargarEmpresa(): void {
    this.empresaService.obtenerEmpresa().subscribe({
      next: (data) => {
        this.empresa = data;
      },
      error: (error) => {
        console.error('Error al cargar empresa:', error);
      }
    });
  }


  obtenerUsuarioActual(): void {
  this.authService.getUsuarioActual().subscribe((usuario: any) => {
    this.usuarioActual = usuario;
    this.inicializarDatosReporte();
  });
}


  verificarPropiedadesUsuarios(): void {
    if (this.usuarios.length > 0) {
      console.log('Estructura de Usuarios:', Object.keys(this.usuarios[0]));
    }
  }

  buscarUsuario(): void {
    const filtro = this.filtroUsuario.trim().toLowerCase();

    if (!filtro) {
      this.usuarios = [...this.originalUsuarios];
      return;
    }

    const usuariosFiltrados = this.originalUsuarios.filter(usuario =>
      usuario.nombre.toLowerCase().includes(filtro) ||
      usuario.apellido.toLowerCase().includes(filtro) ||
      usuario.correo.toLowerCase().includes(filtro)
    );

    this.usuarios = usuariosFiltrados;

    // Mostrar alerta si no hay resultados
    if (usuariosFiltrados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No se encontraron resultados',
        text: 'No hay usuarios que coincidan con el criterio de búsqueda.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  filtrarPorFecha(): void {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas incompletas',
        text: 'Por favor seleccione ambas fechas.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);

    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      Swal.fire({
        icon: 'warning',
        title: 'Fechas inválidas',
        text: 'Por favor ingrese fechas válidas.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if (fin < inicio) {
      Swal.fire({
        icon: 'warning',
        title: 'Rango de fechas inválido',
        text: 'La fecha final no puede ser anterior a la fecha inicial.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    // Normalizar a fechas sin horas (para comparar solo el día)
    const inicioNormalizado = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    const finNormalizado = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate());

    const usuariosFiltrados = this.originalUsuarios.filter(usuario => {
      if (!usuario.fechaCreacion) return false;

      const fechaUsuario = new Date(usuario.fechaCreacion);
      const fechaNormalizada = new Date(fechaUsuario.getFullYear(), fechaUsuario.getMonth(), fechaUsuario.getDate());

      return fechaNormalizada >= inicioNormalizado && fechaNormalizada <= finNormalizado;
    });

    this.usuarios = usuariosFiltrados;

    // Mostrar alerta si no hay resultados
    if (usuariosFiltrados.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No se encontraron resultados',
        text: 'No hay usuarios registrados en el rango de fechas seleccionado.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  usuariosPaginados(): any[] {
    const inicio = (this.paginaActual - 1) * this.elementosPorPagina;
    return this.usuarios.slice(inicio, inicio + this.elementosPorPagina);
  }


exportarPDFFrontend(): void {
  if (!this.usuarioActual) {
    this.authService.getUsuarioActual().subscribe((usuario: any) => {
      this.usuarioActual = usuario;
      this.inicializarDatosReporte();
      this.generarPDF();
    });
  } else {
    this.generarPDF();
  }
}


generarPDF(): void {
  this.inicializarDatosReporte();

  const element = document.getElementById('reporteUsuarios');
  if (!element) {
    console.error('Elemento del reporte no encontrado');
    return;
  }

  setTimeout(() => {
    const clone = element.cloneNode(true) as HTMLElement;

    clone.style.width = '794px'; // Ancho A4 vertical
    clone.style.maxWidth = '100%';
    clone.style.overflow = 'hidden';

    document.body.appendChild(clone);

    const tabla = clone.querySelector('.tabla-usuarios') as HTMLTableElement;
if (tabla) {
  tabla.style.borderCollapse = 'collapse';
  tabla.style.tableLayout = 'auto';         // ✅ Deja que las columnas se ajusten al contenido
  tabla.style.width = '100%';           

  const celdas = tabla.querySelectorAll('th, td');
  celdas.forEach((celda) => {
    const el = celda as HTMLElement;
    el.style.padding = '4px 6px';
    el.style.whiteSpace = 'nowrap';         // ✅ Evita saltos de línea
    el.style.overflow = 'visible';          // ✅ Muestra todo el contenido
    el.style.textOverflow = 'clip';         // ✅ No corta texto con "..."
    el.style.fontSize = '12px';
    el.style.fontFamily = 'Arial, sans-serif';
  });
}


    // Usamos escala mayor para más resolución
    html2canvas(clone, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('portrait', 'mm', 'a4');
      const pdfWidth = 210; // mm en portrait
      const pdfHeight = 297;

      const imgProps = pdf.getImageProperties(imgData);
      const scale = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
      const imgWidth = imgProps.width * scale;
      const imgHeight = imgProps.height * scale;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const fileName = `reporte_usuarios_${new Date().toISOString().replace(/[:.]/g, '-')}.pdf`;
      pdf.save(fileName);

      document.body.removeChild(clone);
    });
  }, 250);
}

}
