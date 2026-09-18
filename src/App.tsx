import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './store/appState';
import { useAuth } from './lib/auth';
import { LandingPage } from './pages/LandingPage';
import { CustomerHomePage } from './pages/CustomerHomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ProvidersPage } from './pages/ProvidersPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProviderPortalPage } from './pages/ProviderPortalPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { ToastContainer } from './components/ui/Toast';
import { AuthModal } from './components/ui/AuthModal';
import { ContactAuthModal } from './components/ui/ContactAuthModal';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { CookieConsent } from './components/ui/CookieConsent';
import type { AppUser, PublicView, DashboardView } from './types';
import './index.css';

/**
 * Main application router inside AppProvider context.
 * Implements strict role-based authentication redirect:
 * - Customer -> Customer Home
 * - Service Provider -> Provider Dashboard
 * - Admin -> Admin Dashboard
 * - Unauthenticated -> Public ServiceFinder Home Page
 * - Logout -> Returns to Public Home Page
 */
function MainRouter() {
  const {
    state,
    setUser,
    setAuthLoading,
    setPublicView,
    setView,
    setProblemText,
    addToast,
    closeContactModal,
    setContactModalOpen,
    clearPendingContactAction,
  } = useApp();
  const { user: authUser, loading: authHookLoading, logout } = useAuth();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalRole, setAuthModalRole] = useState<'customer' | 'provider' | null>(null);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup'>('signin');

  // Sync auth hook state with global state store & enforce provider route locking
  useEffect(() => {
    if (!authHookLoading) {
      setUser(authUser);
      setAuthLoading(false);
      if (authUser?.role === 'provider') {
        const allowedViews = ['provider', 'terms', 'privacy', 'contact', 'about'];
        const currentPath = (window.location.pathname.toLowerCase().replace(/\/$/, '') || '').replace(/^\//, '');
        if (allowedViews.includes(currentPath)) {
          setPublicView(currentPath as PublicView);
        } else {
          setPublicView('provider');
          if (window.location.pathname !== '/provider') {
            window.history.replaceState(null, '', '/provider');
          }
        }
      }
    }
  }, [authUser, authHookLoading, setUser, setAuthLoading, setPublicView]);

  // Support direct administrator entry via URL pathname and hash, and enforce provider isolation
  useEffect(() => {
    const syncRouteFromLocation = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '') || '';
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '') || '';
      const route = pathname || hash;

      // 1. SERVICE PROVIDER ROUTE GUARD:
      // A service provider CAN access provider portal (/provider) AND informational/legal pages (/contact, /terms, /privacy, /about).
      // If a provider navigates to customer directory routes (/, /providers, /services, /customer_home),
      // redirect them back to /provider.
      if (state.user?.role === 'provider') {
        const allowedProviderRoutes = [
          '/provider', 'provider',
          '/terms', 'terms',
          '/privacy', 'privacy',
          '/contact', 'contact',
          '/about', 'about'
        ];
        if (!allowedProviderRoutes.includes(route)) {
          setPublicView('provider');
          if (window.location.pathname !== '/provider') {
            window.history.replaceState(null, '', '/provider');
          }
          return;
        }
      }

      if (route === '/admin/login' || route === 'admin/login' || route === 'admin_login' || route === 'admin-login') {
        if (state.user?.role === 'admin') {
          setView('admin');
          setPublicView('admin');
          if (window.location.pathname !== '/admin/dashboard') {
            window.history.replaceState(null, '', '/admin/dashboard');
          }
        } else {
          setPublicView('admin_login');
        }
        return;
      }

      if (route === '/admin/dashboard' || route === 'admin/dashboard' || route === '/admin' || route === 'admin' || pathname === '/admin/dashboard' || pathname === '/admin') {
        if (state.user?.role === 'admin') {
          setPublicView('admin');
          const validViews: DashboardView[] = ['admin', 'directory', 'onboarding', 'finder', 'profile', 'settings'];
          if (hash && validViews.includes(hash as DashboardView)) {
            setView(hash as DashboardView);
          } else {
            setView('admin');
          }
        } else {
          // Protected route: unauthorized users redirected to login
          setPublicView('admin_login');
          if (window.location.pathname !== '/admin/login') {
            window.history.replaceState(null, '', '/admin/login');
          }
          addToast('ACCESS RESTRICTED: Please sign in with administrator credentials.', 'warning');
        }
        return;
      }

      if (route === '/provider' || route === 'provider') {
        if (state.user?.role === 'customer') {
          addToast('The Provider Portal is for service professionals only.', 'info');
          setPublicView('customer_home');
          if (window.location.pathname !== '/customer_home') {
            window.history.replaceState(null, '', '/customer_home');
          }
          return;
        }
        setPublicView('provider');
        return;
      }
      if (route === '/providers' || route === 'providers') {
        setPublicView('providers');
        return;
      }
      if (route === '/services' || route === 'services') {
        setPublicView('services');
        return;
      }
      if (route === '/about' || route === 'about') {
        setPublicView('about');
        return;
      }
      if (route === '/contact' || route === 'contact') {
        setPublicView('contact');
        return;
      }
      if (route === '/terms' || route === 'terms') {
        setPublicView('terms');
        return;
      }
      if (route === '/privacy' || route === 'privacy') {
        setPublicView('privacy');
        return;
      }
      if (route === '/customer_home' || route === 'customer_home') {
        setPublicView('customer_home');
        return;
      }
    };

    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, [state.user, setView, setPublicView, addToast]);

  const handleOpenSignIn = (preferredRole?: 'customer' | 'provider', initialMode: 'signin' | 'signup' = 'signin') => {
    setAuthModalRole(preferredRole || null);
    setAuthModalInitialMode(initialMode);
    setAuthModalOpen(true);
  };

  // Automatically continue pending action upon contact modal auth
  const handleContactAuthSuccess = (loggedUser: AppUser) => {
    setUser(loggedUser);
    closeContactModal();
    addToast(`Welcome, ${loggedUser.name || 'Member'}!`, 'success');

    const pending = state.pendingContactAction;
    clearPendingContactAction();

    // STRICT CUSTOMER GATING: Only authenticated customers may initiate calls or WhatsApp messages
    if (loggedUser.role === 'customer' && pending) {
      if (pending.type === 'call' && pending.phone) {
        window.location.href = `tel:${pending.phone}`;
      } else if (pending.type === 'whatsapp' && pending.whatsappUrl) {
        window.open(pending.whatsappUrl, '_blank');
      }
    }
  };

  // Explicit role-based redirect upon successful full authentication
  const handleAuthSuccess = (loggedUser: AppUser) => {
    setUser(loggedUser);
    setAuthModalOpen(false);
    addToast(`Welcome, ${loggedUser.name || 'Member'}!`, 'success');

    const pending = state.pendingContactAction;
    clearPendingContactAction();

    // STRICT CUSTOMER GATING: Providers are barred from calling other providers
    if (loggedUser.role === 'customer' && pending) {
      if (pending.type === 'call' && pending.phone) {
        window.location.href = `tel:${pending.phone}`;
      } else if (pending.type === 'whatsapp' && pending.whatsappUrl) {
        window.open(pending.whatsappUrl, '_blank');
      }
    }

    if (loggedUser.role === 'customer') {
      if (!pending) {
        setPublicView('customer_home');
        window.history.pushState(null, '', '/customer_home');
      }
    } else if (loggedUser.role === 'provider') {
      setPublicView('provider');
      window.history.pushState(null, '', '/provider');
    } else if (loggedUser.role === 'admin') {
      setView('admin');
      setPublicView('admin');
      window.history.pushState(null, '', '/admin/dashboard');
    } else {
      setPublicView('home');
      window.history.pushState(null, '', '/');
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setPublicView('home');
    window.history.pushState(null, '', '/');
    addToast('Signed out successfully', 'info');
  };

  const handleSelectCategoryFromServices = (category: string) => {
    setProblemText(`${category} service request`);
    setPublicView('providers');
    window.history.pushState(null, '', '/providers');
  };

  // Safe navigation handler that strictly enforces role-based access
  const handleNavigate = (view: PublicView) => {
    // 1. SERVICE PROVIDER NAVIGATION ENFORCEMENT:
    // Providers are allowed to access Provider Portal AND informational/legal pages:
    // contact, terms, privacy, and about.
    // They cannot navigate to customer directory discovery pages (providers, services, customer_home).
    if (state.user?.role === 'provider') {
      const allowedProviderViews: PublicView[] = ['provider', 'contact', 'terms', 'privacy', 'about'];
      if (!allowedProviderViews.includes(view)) {
        // If provider clicks home/overview, gracefully return to provider portal
        setPublicView('provider');
        if (window.location.pathname !== '/provider') {
          window.history.pushState(null, '', '/provider');
        }
        return;
      }
      setPublicView(view);
      const targetPath = view === 'provider' ? '/provider' : `/${view}`;
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, '', targetPath);
      }
      return;
    }

    // 2. STRICT CUSTOMER NAVIGATION ENFORCEMENT:
    // Customers are confined to customer routes and cannot access provider portal
    if (state.user?.role === 'customer' && view === 'provider') {
      addToast('The Provider Portal is for service professionals only.', 'info');
      setPublicView('customer_home');
      if (window.location.pathname !== '/customer_home') {
        window.history.replaceState(null, '', '/customer_home');
      }
      return;
    }

    if (view === 'admin') {
      if (state.user?.role === 'admin') {
        setView('admin');
        setPublicView('admin');
        window.history.pushState(null, '', '/admin/dashboard');
      } else {
        setPublicView('admin_login');
        window.history.pushState(null, '', '/admin/login');
        addToast('ACCESS RESTRICTED: Please authenticate as Administrator.', 'warning');
      }
      return;
    }

    if (view === 'admin_login') {
      if (state.user?.role === 'admin') {
        setView('admin');
        setPublicView('admin');
        window.history.pushState(null, '', '/admin/dashboard');
      } else {
        setPublicView('admin_login');
        window.history.pushState(null, '', '/admin/login');
      }
      return;
    }

    if (view === 'customer_home') {
      if (state.user && state.user.role === 'customer') {
        setPublicView('customer_home');
        window.history.pushState(null, '', '/customer_home');
      } else if (!state.user) {
        handleOpenSignIn('customer');
      } else {
        setPublicView('customer_home');
        window.history.pushState(null, '', '/customer_home');
      }
      return;
    }

    const pathMap: Record<string, string> = {
      home: '/',
      services: '/services',
      providers: '/providers',
      about: '/about',
      contact: '/contact',
      terms: '/terms',
      privacy: '/privacy',
      provider: '/provider',
    };
    if (pathMap[view]) {
      window.history.pushState(null, '', pathMap[view]);
    }
    setPublicView(view);
  };

  // Render current view
  const renderCurrentView = () => {
    // Admin Control Center: Strictly gated to confirmed admin users
    if (state.publicView === 'admin' || state.currentView === 'admin') {
      if (state.user?.role === 'admin') {
        return <DashboardPage />;
      }
      return (
        <AdminLoginPage
          onNavigate={handleNavigate}
          onAdminAuthenticated={handleAuthSuccess}
        />
      );
    }

    if (state.publicView === 'admin_login') {
      return (
        <AdminLoginPage
          onNavigate={handleNavigate}
          onAdminAuthenticated={handleAuthSuccess}
        />
      );
    }

    // Service Provider Experience: Strictly gated to Provider Portal
    // Provider CANNOT see customer directory, search, or other provider profiles,
    // but CAN freely view legal terms, privacy policy, contact, and about pages!
    if (state.user?.role === 'provider') {
      if (state.publicView === 'terms') {
        return <TermsPage onNavigate={handleNavigate} onSignIn={() => {}} />;
      }
      if (state.publicView === 'privacy') {
        return <PrivacyPolicyPage onNavigate={handleNavigate} onSignIn={() => {}} />;
      }
      if (state.publicView === 'contact') {
        return <ContactPage onNavigate={handleNavigate} onSignIn={() => {}} />;
      }
      if (state.publicView === 'about') {
        return <AboutPage onNavigate={handleNavigate} onSignIn={() => {}} />;
      }
      return (
        <ProviderPortalPage
          onNavigate={handleNavigate}
          onSignInCustomer={() => {}}
        />
      );
    }

    switch (state.publicView) {
      case 'customer_home':
        return (
          <CustomerHomePage
            onNavigate={handleNavigate}
            onLogout={handleLogout}
          />
        );

      case 'services':
        return (
          <ServicesPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
            onSelectCategory={handleSelectCategoryFromServices}
          />
        );

      case 'providers':
        return (
          <ProvidersPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
          />
        );

      case 'about':
        return (
          <AboutPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
          />
        );

      case 'contact':
        return (
          <ContactPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
          />
        );

      case 'terms':
        return (
          <TermsPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
          />
        );

      case 'privacy':
        return (
          <PrivacyPolicyPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer')}
          />
        );

      case 'provider':
        return (
          <ProviderPortalPage
            onNavigate={handleNavigate}
            onSignInCustomer={() => handleOpenSignIn('customer')}
          />
        );

      case 'home':
      default:
        return (
          <LandingPage
            onNavigate={handleNavigate}
            onSignIn={() => handleOpenSignIn('customer', 'signin')}
            onRegisterProvider={() => handleOpenSignIn('provider', 'signup')}
          />
        );
    }
  };

  return (
    <>
      <AmbientBackground />
      {renderCurrentView()}
      <ToastContainer />
      <CookieConsent />

      {/* Centralized Role-Based Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialRole={authModalRole}
        initialMode={authModalInitialMode}
      />

      {/* Gated Contact & Review Auth Modal */}
      <ContactAuthModal
        isOpen={state.contactModalOpen}
        onClose={closeContactModal}
        onAuthSuccess={handleContactAuthSuccess}
        onOpenFullAuth={() => {
          setContactModalOpen(false);
          handleOpenSignIn('customer');
        }}
        actionType={state.pendingContactAction?.type}
        providerName={state.pendingContactAction?.providerName}
      />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}

export default App;
