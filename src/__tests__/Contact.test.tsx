import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Contact } from '../components/sections/Contact';
import type { ContactData, ContactInfo } from '../types';

const mockContactData: ContactData = {
  eyebrow: 'Get in Touch',
  titleHtml: "Come Visit.<br><em>We'll Show You Around.</em>",
  formOptions: {
    batches: ['Morning (5AM–11AM)', 'Evening (4PM–9PM)', 'Either works'],
    goals: ['Weight Loss', 'Build Muscle', 'Improve Fitness & Stamina'],
  },
};

const mockContactInfo: ContactInfo = {
  phone: '+91 86690 84921',
  whatsappUrl: 'https://wa.me/918669084921',
  address:
    'Madhuvimal Plaza, 2nd Floor, Opp. Dadawadi Temple (Dalchini Hotel), Dadawadi, Jalgaon — 425001, MH',
  instagram: '@conqueror_fitness_hub',
  instagramUrl: 'https://instagram.com/conqueror_fitness_hub',
  mapUrl: 'https://maps.app.goo.gl/Dt7G9R6vpVnsK47H9',
};

describe('Contact', () => {
  const originalAlert = window.alert;
  let alertMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    alertMock = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.alert = alertMock as any;
  });

  afterEach(() => {
    window.alert = originalAlert;
  });

  // ─── Rendering Tests ────────────────────────────────────────

  it('renders the contact info section with eyebrow text', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    expect(screen.getByText('Get in Touch')).toBeInTheDocument();
  });

  it('renders the phone number as a link', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    expect(screen.getByText('+91 86690 84921')).toBeInTheDocument();
  });

  it('renders the Instagram handle', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    expect(screen.getByText('@conqueror_fitness_hub')).toBeInTheDocument();
  });

  it('renders the enquiry form with all fields', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/whatsapp number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select membership plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select preferred batch/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/select fitness goal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
  });

  it('renders the consent checkbox', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    expect(screen.getByLabelText(/i agree to be contacted/i)).toBeInTheDocument();
  });

  it('renders the submit button', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    expect(screen.getByRole('button', { name: /submit enquiry/i })).toBeInTheDocument();
  });

  it('renders batch options from data', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);
    const batchSelect = screen.getByLabelText(/select preferred batch/i);

    expect(batchSelect).toBeInTheDocument();
    expect(screen.getByText('Morning (5AM–11AM)')).toBeInTheDocument();
    expect(screen.getByText('Evening (4PM–9PM)')).toBeInTheDocument();
    expect(screen.getByText('Either works')).toBeInTheDocument();
  });

  it('renders goal options from data', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    expect(screen.getByText('Weight Loss')).toBeInTheDocument();
    expect(screen.getByText('Build Muscle')).toBeInTheDocument();
    expect(screen.getByText('Improve Fitness & Stamina')).toBeInTheDocument();
  });

  // ─── Form Validation Tests ────────────────────────────────────

  it('alerts when submitting without first name', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    fireEvent.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(alertMock).toHaveBeenCalledWith('Please enter your first name.');
  });

  it('alerts when submitting without phone number', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Rahul' } });
    fireEvent.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(alertMock).toHaveBeenCalledWith('Please enter your WhatsApp number.');
  });

  it('alerts when submitting without consent', () => {
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: 'Rahul' } });
    fireEvent.change(screen.getByLabelText(/whatsapp number/i), {
      target: { value: '+919876543210' },
    });
    fireEvent.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(alertMock).toHaveBeenCalledWith('Please agree to be contacted to proceed.');
  });

  // ─── Successful Submission Test ────────────────────────────────

  it('shows success message after valid submission', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    await user.type(screen.getByLabelText(/first name/i), 'Rahul');
    await user.type(screen.getByLabelText(/whatsapp number/i), '+919876543210');
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(screen.getByText('Enquiry Received!')).toBeInTheDocument();
    expect(screen.getByText(/our team will contact you within 24 hours/i)).toBeInTheDocument();
  });

  it('hides the form after successful submission', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    await user.type(screen.getByLabelText(/first name/i), 'Rahul');
    await user.type(screen.getByLabelText(/whatsapp number/i), '+919876543210');
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(screen.queryByRole('button', { name: /submit enquiry/i })).not.toBeInTheDocument();
  });

  it('shows WhatsApp send link after submission', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    await user.type(screen.getByLabelText(/first name/i), 'Rahul');
    await user.type(screen.getByLabelText(/whatsapp number/i), '+919876543210');
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

    expect(screen.getByText(/also send via whatsapp/i)).toBeInTheDocument();
  });

  // ─── Input Interaction Tests ────────────────────────────────

  it('allows typing in text fields', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    const firstNameInput = screen.getByLabelText(/first name/i);
    const lastNameInput = screen.getByLabelText(/last name/i);
    const phoneInput = screen.getByLabelText(/whatsapp number/i);
    const emailInput = screen.getByLabelText(/email address/i);

    await user.type(firstNameInput, 'Rahul');
    await user.type(lastNameInput, 'Sharma');
    await user.type(phoneInput, '+919876543210');
    await user.type(emailInput, 'rahul@test.com');

    expect(firstNameInput).toHaveValue('Rahul');
    expect(lastNameInput).toHaveValue('Sharma');
    expect(phoneInput).toHaveValue('+919876543210');
    expect(emailInput).toHaveValue('rahul@test.com');
  });

  it('allows selecting dropdown values', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    const planSelect = screen.getByLabelText(/select membership plan/i);
    await user.selectOptions(planSelect, 'Premium – ₹1,200/mo');
    expect(planSelect).toHaveValue('Premium – ₹1,200/mo');

    const batchSelect = screen.getByLabelText(/select preferred batch/i);
    await user.selectOptions(batchSelect, 'Morning (5AM–11AM)');
    expect(batchSelect).toHaveValue('Morning (5AM–11AM)');

    const goalSelect = screen.getByLabelText(/select fitness goal/i);
    await user.selectOptions(goalSelect, 'Weight Loss');
    expect(goalSelect).toHaveValue('Weight Loss');
  });

  it('allows toggling the consent checkbox', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    const checkbox = screen.getByLabelText(/i agree to be contacted/i);
    expect(checkbox).not.toBeChecked();

    await user.click(checkbox);
    expect(checkbox).toBeChecked();

    await user.click(checkbox);
    expect(checkbox).not.toBeChecked();
  });

  it('allows typing in the message textarea', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    const textarea = screen.getByLabelText(/message/i);
    await user.type(textarea, 'I want to join ASAP!');
    expect(textarea).toHaveValue('I want to join ASAP!');
  });

  // ─── initialPlan Prop Test ─────────────────────────────────

  it('sets the plan dropdown from initialPlan prop', () => {
    render(
      <Contact data={mockContactData} info={mockContactInfo} initialPlan="Free Trial First" />,
    );
    const planSelect = screen.getByLabelText(/select membership plan/i);
    expect(planSelect).toHaveValue('Free Trial First');
  });

  // ─── Full form submission with all fields ──────────────────

  it('submits successfully with all fields filled', async () => {
    const user = userEvent.setup();
    render(<Contact data={mockContactData} info={mockContactInfo} />);

    await user.type(screen.getByLabelText(/first name/i), 'Rahul');
    await user.type(screen.getByLabelText(/last name/i), 'Sharma');
    await user.type(screen.getByLabelText(/whatsapp number/i), '+919876543210');
    await user.type(screen.getByLabelText(/email address/i), 'rahul@test.com');
    await user.selectOptions(
      screen.getByLabelText(/select membership plan/i),
      'Premium – ₹1,200/mo',
    );
    await user.selectOptions(
      screen.getByLabelText(/select preferred batch/i),
      'Morning (5AM–11AM)',
    );
    await user.selectOptions(screen.getByLabelText(/select fitness goal/i), 'Weight Loss');
    await user.type(screen.getByLabelText(/message/i), 'Looking forward!');
    await user.click(screen.getByLabelText(/i agree to be contacted/i));
    await user.click(screen.getByRole('button', { name: /submit enquiry/i }));

    // Should show success, no alert
    expect(alertMock).not.toHaveBeenCalled();
    expect(screen.getByText('Enquiry Received!')).toBeInTheDocument();
  });
});
