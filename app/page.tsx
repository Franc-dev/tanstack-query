// app/page.tsx
import CreateTicketForm from '@/components/CreateTicketForm';
import TicketList from '@/components/TicketList';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white py-8">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-300">
          Ticket Management System
        </h1>
        <p className="mt-3 text-lg text-gray-600">
          Powered by Next.js, Prisma, Tailwind CSS, and TanStack Query
        </p>
      </header>

      {/* Section to create a new ticket */}
      <div className="max-w-6xl mx-auto px-4">
        <section className="mb-12">
          <CreateTicketForm />
        </section>

        {/* Section to display the list of tickets */}
        <section>
          <TicketList />
        </section>

        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            Observe TanStack Query behavior using the Devtools (usually a floating icon in development).
          </p>
        </footer>
      </div>
    </div>
  );
}