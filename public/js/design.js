//NAVBAR SCROLL
let lastScrollTop = 0;
const navbar = document.getElementById("navbar");

window.addEventListener("scroll", function() {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

  if (scrollTop > lastScrollTop) {
        // Descendo → esconde navbar
        navbar.classList.remove("show");
    navbar.classList.add("hide");
  } else {
        // Subindo → mostra navbar
        navbar.classList.remove("hide");
    navbar.classList.add("show");
  }

  // Encolhe ao descer
  if (scrollTop > 50) {
        navbar.classList.add("shrink");
  } else {
        navbar.classList.remove("shrink");
  }

    lastScrollTop = scrollTop;
});

//FERRAMENTAS SCROLL
var swiper = new Swiper(".mySwiper", {
    slidesPerView: 4,
    spaceBetween: 30,
    loop: true,
    autoplay: {
        delay: 2300,
        disableOnInteraction: false,
    },
    navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
    },
    pagination: {
        el: ".swiper-pagination",
        clickable: true,
    },
    breakpoints: {
        320: { slidesPerView: 2, spaceBetween: 15 },
        768: { slidesPerView: 3, spaceBetween: 20 },
        1024: { slidesPerView: 4, spaceBetween: 30 }
    }
});
// PAUSAR AO CLICAR
document.querySelectorAll('.mySwiper .swiper-slide').forEach(slide => {
    slide.addEventListener('click', () => {
        swiper.autoplay.stop();
    });
});
// VOLTAR A RODAR QUANDO CLICAR FORA DO SWIPER
document.addEventListener('click', (e) => {
    const swiperElement = document.querySelector('.mySwiper');

    // se clicou fora do swiper → volta a rodar
    if (!swiperElement.contains(e.target)) {
        swiper.autoplay.start();
    }
});


//GRADIENTE IMAGENS
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".swiper-slide img.ferramenta").forEach(img => {
        const url = img.getAttribute("src");

        // cria wrapper para receber a máscara dourada
        const mask = document.createElement("div");
        mask.className = "fmask";
        mask.style.setProperty("--mask", `url(${url})`);

        // insere a máscara e remove a imagem
        img.parentNode.insertBefore(mask, img);
        img.remove();
    });
});

// CLIQUE
document.addEventListener("DOMContentLoaded", () => {
    const card = document.querySelector(".flip-card");

    // Clicar no card -> vira
    card.addEventListener("click", (e) => {
        card.classList.add("flipped");
        e.stopPropagation(); // evita fechar ao clicar dentro
    });

    // Clicar fora -> volta
    document.addEventListener("click", (e) => {
        if (!card.contains(e.target)) {
            card.classList.remove("flipped");
        }
    });
});

const skillsSelecionadas = [];

document.addEventListener("DOMContentLoaded", () => {
    const slides = document.querySelectorAll('.swiper-slide');
    const textarea = document.querySelector('textarea[name="mensagem"]');

    // Função para atualizar a frase de skills mantendo o que o usuário escreveu
    function atualizarSkillsFrase() {
        if (!textarea) return;

        let texto = textarea.value;

        // Remove frase antiga de skills se existir
        texto = texto.replace(/\n\nTenho interesse em conhecer melhor as skills em .*?\.\n?/g, '').trim();

        // Adiciona a frase atualizada de skills
        if (skillsSelecionadas.length > 0) {
            texto += (texto ? " " : "") + `\n\nTenho interesse em conhecer melhor as skills em ${skillsSelecionadas.join(", ")}.\n`;
        }

        textarea.value = texto;
    }

    slides.forEach(slide => {
        const nomeSkill = slide.querySelector('p').innerText;
        const mask = slide.querySelector('.fmask');

        slide.addEventListener('click', () => {
            if (mask.classList.contains('selecionada')) {
                mask.classList.remove('selecionada');
                const index = skillsSelecionadas.indexOf(nomeSkill);
                if (index > -1) skillsSelecionadas.splice(index, 1);
            } else {
                mask.classList.add('selecionada');
                skillsSelecionadas.push(nomeSkill);
            }

            atualizarSkillsFrase();
        });
    });
});




// EMAIL
function criarMailto() {
    const nome = document.getElementById('inputNome').value.trim();
    const empresa = document.getElementById('inputEmpresa').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const telefone = document.getElementById('inputTelefone').value.trim();

    let body = "Olá equipe da V@E,\n\n";
    body += "Tenho interesse em conhecer melhor os serviços de vocês e avaliar como poderiam nos ajudar com nossos projetos.";
    if (skillsSelecionadas.length > 0) body += `Também gostaria de saber um pouco mais sobre a/s skill/s em ${skillsSelecionadas.join(", ")}.`;

    if (nome || empresa || email || telefone) body += `\n\nSegue abaixo meus dados para contato:\n`
    if (nome) body += `Nome: ${nome}\n`;
    if (empresa) body += `Empresa: ${empresa}\n`;
    if (email) body += `E-mail: ${email}\n`;
    if (telefone) body += `Telefone: ${telefone}\n`;


    body += "\nFicaria feliz se pudessem me enviar mais informações ou um possível contrato/serviço que se encaixe nas nossas necessidades.\n\nAguardo seu retorno.\n\nMensagem de envio automático.\n";

    const subject = `Solicitação de serviço – ${nome || "Cliente potencial"}`;
    const mailto = `mailto:bruno@vilelasae.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Abrir o rascunho no cliente de e-mail
    window.location.href = mailto;
}

// COOKIES INFO
// Mostrar banner se não aceitou cookies
if (!localStorage.getItem('cookiesAccepted')) {
    document.getElementById('cookie-banner').style.display = 'block';
} else {
    document.getElementById('cookie-banner').style.display = 'none';
}

// Expandir e contrair banner
document.querySelector('.cookie-short').addEventListener('click', function () {
    document.getElementById('cookie-banner').classList.toggle('expanded');
});

// Aceitar cookies
document.getElementById('accept-cookies').addEventListener('click', function () {
    localStorage.setItem('cookiesAccepted', 'true');
    document.getElementById('cookie-banner').style.display = 'none';
});

