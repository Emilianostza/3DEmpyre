import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLocale } from '@/contexts/LocaleContext';
import { useTranslation } from 'react-i18next';

// --------------------------------------------------------------------------
// Mocks
// --------------------------------------------------------------------------

const mockSwitchLocale = vi.fn();
const mockChangeLanguage = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => key),
    i18n: { language: 'en', changeLanguage: mockChangeLanguage },
  })),
}));

vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: vi.fn(() => ({
    locale: 'en',
    switchLocale: mockSwitchLocale,
  })),
}));

vi.mock('lucide-react', () => ({
  Globe: (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="globe-icon" {...props} />,
}));

const mockedUseLocale = vi.mocked(useLocale);
const mockedUseTranslation = vi.mocked(useTranslation);

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseLocale.mockReturnValue({
      locale: 'en',
      isLocalePrefixed: false,
      localePath: (p: string) => p,
      stripLocalePath: (p: string) => p,
      switchLocale: mockSwitchLocale,
    });
    mockedUseTranslation.mockReturnValue({
      t: vi.fn((key: string) => key),
      i18n: { language: 'en', changeLanguage: mockChangeLanguage },
      ready: true,
    } as any);
  });

  it('renders the language button with Globe icon', () => {
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: 'Change language' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('globe-icon')).toBeInTheDocument();
  });

  it('shows current locale code (uppercase) in the button', () => {
    render(<LanguageSwitcher />);

    // The locale code is shown in a span inside the button
    const button = screen.getByRole('button', { name: 'Change language' });
    expect(button).toHaveTextContent('en');
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Dropdown should not be visible initially
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

    // Click the button to open
    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);

    // Dropdown should now be visible
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('dropdown shows all 4 language options (en, de, es, ru)', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);

    // Each option should contain the translated key for the language
    expect(options[0]).toHaveTextContent('lang.en');
    expect(options[1]).toHaveTextContent('lang.de');
    expect(options[2]).toHaveTextContent('lang.es');
    expect(options[3]).toHaveTextContent('lang.ru');
  });

  it('clicking a language calls switchLocale and closes dropdown', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);

    // Click the German option
    const options = screen.getAllByRole('option');
    await user.click(options[1]); // 'de' is index 1

    expect(mockSwitchLocale).toHaveBeenCalledWith('de');

    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('active language has aria-selected=true', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);

    const options = screen.getAllByRole('option');
    // 'en' is the active locale, so the first option should be selected
    expect(options[0]).toHaveAttribute('aria-selected', 'true');
    expect(options[1]).toHaveAttribute('aria-selected', 'false');
    expect(options[2]).toHaveAttribute('aria-selected', 'false');
    expect(options[3]).toHaveAttribute('aria-selected', 'false');
  });

  it('active language is highlighted with brand color class', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);

    const options = screen.getAllByRole('option');
    // Active option ('en') should have the brand-400 class
    expect(options[0].className).toContain('text-brand-400');
    // Inactive options should not
    expect(options[1].className).not.toContain('text-brand-400');
  });

  it('dropdown closes on Escape key', async () => {
    const user = userEvent.setup();
    render(<LanguageSwitcher />);

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Press Escape
    await user.keyboard('{Escape}');

    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('dropdown closes on click outside', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <div data-testid="outside">Outside area</div>
        <LanguageSwitcher />
      </div>
    );

    // Open dropdown
    const button = screen.getByRole('button', { name: 'Change language' });
    await user.click(button);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    // Click outside
    const outside = screen.getByTestId('outside');
    await user.click(outside);

    // Dropdown should be closed
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
