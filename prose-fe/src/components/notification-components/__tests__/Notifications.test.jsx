import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotificationCard } from '../notification-ui/NotificationCard';
import { NotificationItem } from '../notification-ui/NotificationItem';
import { NotificationGroupDropdown } from '../notification-ui/NotificationGroupDropdown';
import { NotificationCloseButton } from '../notification-ui/NotificationCloseButton';
import {I18nProvider} from "../../../context/I18nContext.jsx";

const mockUser = { token: 'test-token', role: 'GESTIONNAIRE' };

describe('NotificationCard UI', () => {
    const mockProps = {
        markGroupAndNavigate: vi.fn(),
        list: [
            { id: 1, messageFR: 'Test 1', messageEN: 'Test 1', createdAt: '2024-01-01T10:00:00' },
            { id: 2, messageFR: 'Test 2', messageEN: 'Test 2', createdAt: '2024-01-02T10:00:00' }
        ],
        typeKey: 'stage',
        count: 2,
        open: false,
        dropdownId: 'test-dropdown',
        setOpenType: vi.fn(),
        markAndNavigate: vi.fn(),
        setReadCounter: vi.fn(),
        markAndReload: vi.fn(),
        user: mockUser
    };

    const renderWithI18n = (component, locale = 'fr') => {
        return render(
            <I18nProvider defaultLocale={locale}>
                {component}
            </I18nProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders card with correct count and label', () => {
        renderWithI18n(<NotificationCard {...mockProps} />);
        const countElement = screen.getByText(/2\s+nouvelles offre\(s\) de stage à approuver/);
        expect(countElement).toBeInTheDocument();
    });

    it('displays notification items when count <= 3', () => {
        renderWithI18n(<NotificationCard {...mockProps} />);
        expect(screen.getByText(/Test 1/)).toBeInTheDocument();
        expect(screen.getByText(/Test 2/)).toBeInTheDocument();
    });

    it('hides notification items when count >= 4', () => {
        const largeList = Array.from({ length: 4 }, (_, i) => ({
            id: i + 1,
            messageFR: `Test ${i}`,
            messageEN: `Test ${i}`,
            createdAt: '2024-01-01T10:00:00'
        }));
        renderWithI18n(<NotificationCard {...mockProps} list={largeList} count={4} />);
        expect(screen.queryByText(/Test 0/)).not.toBeInTheDocument();
    });

    it('shows toggle button when count >= 4', () => {
        renderWithI18n(<NotificationCard {...mockProps} count={4} />);
        expect(screen.getByLabelText(/Toggle notifications dropdown/)).toBeInTheDocument();
    });

    it('calls setOpenType when toggle button clicked', () => {
        renderWithI18n(<NotificationCard {...mockProps} count={4} />);
        const toggleButton = screen.getByLabelText(/Toggle notifications dropdown/);
        fireEvent.click(toggleButton);
        expect(mockProps.setOpenType).toHaveBeenCalledWith('stage');
    });

    it('calls markGroupAndNavigate when card clicked', () => {
        renderWithI18n(<NotificationCard {...mockProps} />);
        const card = screen.getByRole('button', { name: /nouvelles offre\(s\) de stage à approuver/ });
        fireEvent.click(card);
        expect(mockProps.markGroupAndNavigate).toHaveBeenCalledWith('stage', mockProps.list);
    });

    it('applies hover styles correctly', () => {
        renderWithI18n(<NotificationCard {...mockProps} />);
        const card = screen.getByRole('button', { name: /nouvelles offre\(s\) de stage à approuver/ });
        expect(card).toHaveClass('hover:shadow-md');
    });

    it('displays EyeOff icon when open', () => {
        renderWithI18n(<NotificationCard {...mockProps} count={4} open={true} />);
        const toggleButton = screen.getByLabelText(/Toggle notifications dropdown/);
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
    });
});

describe('NotificationItem UI', () => {
    const mockNotification = {
        id: 1,
        messageFR: 'Test notification message',
        messageEN: 'Test notification message',
        createdAt: '2024-01-01T10:00:00'
    };

    const mockProps = {
        notification: mockNotification,
        markAndNavigate: vi.fn(),
        typeKey: 'stage',
        setReadCounter: vi.fn(),
        markAndReload: vi.fn()
    };

    const renderWithI18n = (component, locale = 'fr') => {
        return render(
            <I18nProvider defaultLocale={locale}>
                {component}
            </I18nProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders notification message', () => {
        renderWithI18n(<NotificationItem {...mockProps} />);
        expect(screen.getByText(/Test notification message/)).toBeInTheDocument();
    });

    it('displays formatted timestamp', () => {
        renderWithI18n(<NotificationItem {...mockProps} />);
        const timestamp = new Date('2024-01-01T10:00:00').toLocaleString();
        expect(screen.getByText(timestamp)).toBeInTheDocument();
    });

    it('shows notification icon', () => {
        renderWithI18n(<NotificationItem {...mockProps} />);
        const icon = screen.getByText('!');
        expect(icon).toBeInTheDocument();
    });

    it('calls markAndNavigate when clicked', () => {
        renderWithI18n(<NotificationItem {...mockProps} />);
        const item = screen.getByText(/Test notification message/).closest('div');
        fireEvent.click(item);
        expect(mockProps.markAndNavigate).toHaveBeenCalled();
    });

    it('applies hover styles', () => {
        renderWithI18n(<NotificationItem {...mockProps} />);
        const listItem = screen.getByRole('listitem');
        expect(listItem).toHaveClass('hover:bg-gray-100');
    });

    it('truncates long messages', () => {
        const longMessage = 'A'.repeat(250);
        const notification = { ...mockNotification, messageFR: longMessage, messageEN: longMessage };
        renderWithI18n(<NotificationItem {...mockProps} notification={notification} />);
        const elements = screen.getAllByText(/A+/);
        const messageText = elements[0];
        expect(messageText.textContent).toContain('...');
    });
});

describe('NotificationGroupDropdown UI', () => {
    const mockList = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        messageFR: `Notification ${i}`,
        messageEN: `Notification ${i}`,
        createdAt: '2024-01-01T10:00:00'
    }));

    const mockProps = {
        dropdownId: 'test-dropdown',
        list: mockList,
        typeKey: 'stage',
        markAndNavigate: vi.fn(),
        setOpenType: vi.fn(),
        setReadCounter: vi.fn(),
        markAndReload: vi.fn()
    };

    const renderWithI18n = (component, locale = 'fr') => {
        return render(
            <I18nProvider defaultLocale={locale}>
                {component}
            </I18nProvider>
        );
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all notification items', () => {
        renderWithI18n(<NotificationGroupDropdown {...mockProps} />);
        expect(screen.getAllByText(/Notification/)).toHaveLength(10);
    });

    it('limits display to 20 items', () => {
        const manyItems = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            messageFR: `Item ${i}`,
            messageEN: `Item ${i}`,
            createdAt: '2024-01-01T10:00:00'
        }));
        renderWithI18n(<NotificationGroupDropdown {...mockProps} list={manyItems} />);
        expect(screen.getAllByText(/Item/)).toHaveLength(20);
    });

    it('renders close button', () => {
        renderWithI18n(<NotificationGroupDropdown {...mockProps} />);
        expect(screen.getByText('Fermer')).toBeInTheDocument();
    });

    it('calls setOpenType when close button clicked', () => {
        renderWithI18n(<NotificationGroupDropdown {...mockProps} />);
        const closeButton = screen.getByText('Fermer');
        fireEvent.click(closeButton);
        expect(mockProps.setOpenType).toHaveBeenCalledWith(null);
    });

    it('has scrollable content area', () => {
        renderWithI18n(<NotificationGroupDropdown {...mockProps} />);
        const scrollArea = screen.getByRole('menu').querySelector('.overflow-y-auto');
        expect(scrollArea).toHaveClass('max-h-64');
    });

    it('applies correct positioning styles', () => {
        renderWithI18n(<NotificationGroupDropdown {...mockProps} />);
        const dropdown = screen.getByRole('menu');
        expect(dropdown).toHaveClass('absolute', 'left-1/2', 'transform', '-translate-x-1/2');
    });
});

describe('NotificationCloseButton UI', () => {
    const mockUser = { token: 'test-token', role: 'GESTIONNAIRE' };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    const renderWithI18n = (component, locale = 'fr') => {
        return render(
            <I18nProvider defaultLocale={locale}>
                {component}
            </I18nProvider>
        );
    };

    it('renders button with X icon', () => {
        const props = {
            isGroup: false,
            notification: { id: 1 },
            typeKey: 'stage',
            user: mockUser,
            setReadCounter: vi.fn(),
            markAndReload: vi.fn()
        };
        renderWithI18n(<NotificationCloseButton {...props} />);
        const svg = screen.getByRole('img', { hidden: true });
        expect(svg).toBeInTheDocument();
    });

    it('shows correct aria-label for single notification', () => {
        const props = {
            isGroup: false,
            notification: { id: 1 },
            typeKey: 'stage',
            user: mockUser,
            setReadCounter: vi.fn(),
            markAndReload: vi.fn()
        };
        renderWithI18n(<NotificationCloseButton {...props} />);
        expect(screen.getByLabelText(/Mark this notification as read/)).toBeInTheDocument();
    });

    it('shows correct aria-label for group', () => {
        const props = {
            isGroup: true,
            list: [{ id: 1 }, { id: 2 }],
            typeKey: 'stage',
            count: 2,
            user: mockUser,
            setReadCounter: vi.fn(),
            setOpenType: vi.fn()
        };
        renderWithI18n(<NotificationCloseButton {...props} />);
        expect(screen.getByLabelText(/Mark all 2 stage notifications as read/)).toBeInTheDocument();
    });

    it('stops event propagation on click', () => {
       const props = {
            isGroup: false,
            notification: { id: 1 },
            typeKey: 'stage',
            user: mockUser,
            setReadCounter: vi.fn(),
            markAndReload: vi.fn()
        };
        renderWithI18n(<NotificationCloseButton {...props} />);
        const button = screen.getByRole('button');
        button.onclick = (e) => e.stopPropagation();
        button.click();
    });

    it('applies hover styles', () => {
        const props = {
            isGroup: false,
            notification: { id: 1 },
            typeKey: 'stage',
            user: mockUser,
            setReadCounter: vi.fn(),
            markAndReload: vi.fn()
        };
        renderWithI18n(<NotificationCloseButton {...props} />);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('hover:bg-gray-200');
    });
});