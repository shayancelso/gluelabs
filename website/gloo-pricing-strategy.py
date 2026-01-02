from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

# Gloo brand colors
GLOO_PRIMARY = colors.HexColor('#6366F1')  # Indigo
GLOO_SECONDARY = colors.HexColor('#8B5CF6')  # Purple
GLOO_DARK = colors.HexColor('#1E1B4B')  # Dark indigo
GLOO_LIGHT = colors.HexColor('#E0E7FF')  # Light indigo
GLOO_SUCCESS = colors.HexColor('#10B981')  # Green for recommended

def create_pdf():
    doc = SimpleDocTemplate(
        "/Users/shayanmirzazadeh/Documents/Vibes/Glue/website/Gloo-Pricing-Strategy.pdf",
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch
    )

    styles = getSampleStyleSheet()

    # Custom styles
    styles.add(ParagraphStyle(
        name='MainTitle',
        parent=styles['Title'],
        fontSize=28,
        textColor=GLOO_DARK,
        spaceAfter=6,
        alignment=TA_CENTER
    ))

    styles.add(ParagraphStyle(
        name='Subtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=GLOO_PRIMARY,
        spaceAfter=30,
        alignment=TA_CENTER
    ))

    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=GLOO_PRIMARY,
        spaceBefore=20,
        spaceAfter=12,
        borderPadding=5
    ))

    styles.add(ParagraphStyle(
        name='SubHeader',
        parent=styles['Heading2'],
        fontSize=13,
        textColor=GLOO_DARK,
        spaceBefore=12,
        spaceAfter=8
    ))

    styles.add(ParagraphStyle(
        name='GlooBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    ))

    styles.add(ParagraphStyle(
        name='GlooBullet',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#374151'),
        spaceAfter=4,
        leftIndent=20,
        leading=14
    ))

    styles.add(ParagraphStyle(
        name='Highlight',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GLOO_DARK,
        backColor=GLOO_LIGHT,
        borderPadding=10,
        spaceAfter=12,
        alignment=TA_CENTER
    ))

    styles.add(ParagraphStyle(
        name='Quote',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GLOO_DARK,
        leftIndent=30,
        rightIndent=30,
        spaceBefore=10,
        spaceAfter=10,
        leading=14,
        fontName='Helvetica-Oblique'
    ))

    story = []

    # Title Page
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("GLOO", styles['MainTitle']))
    story.append(Paragraph("Pricing Strategy Analysis", styles['Subtitle']))
    story.append(Spacer(1, 0.3*inch))
    story.append(HRFlowable(width="40%", thickness=2, color=GLOO_PRIMARY, spaceBefore=10, spaceAfter=30))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph("Ownership vs. Rental Model", ParagraphStyle(
        'CenterLarge',
        parent=styles['Normal'],
        fontSize=18,
        textColor=GLOO_DARK,
        alignment=TA_CENTER,
        spaceAfter=20
    )))
    story.append(Paragraph("Strategic Decision Framework", ParagraphStyle(
        'CenterMed',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#6B7280'),
        alignment=TA_CENTER,
        spaceAfter=40
    )))
    story.append(Spacer(1, 1*inch))
    story.append(Paragraph("CONFIDENTIAL - Internal Use Only", ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.HexColor('#9CA3AF'),
        alignment=TA_CENTER
    )))
    story.append(Paragraph("January 2026", ParagraphStyle(
        'Date',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#6B7280'),
        alignment=TA_CENTER
    )))

    story.append(PageBreak())

    # Executive Summary
    story.append(Paragraph("1. Executive Summary", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    story.append(Paragraph(
        "Gloo is a pre-revenue B2B SaaS consulting company building custom business intelligence tools "
        "for account management and sales teams. As we prepare to go to market, a fundamental strategic "
        "question must be answered:",
        styles['GlooBody']
    ))

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "<b>Should clients own or rent the tools we build for them?</b>",
        styles['Highlight']
    ))
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Our Recommendation: Hybrid Model (Consulting + SaaS)</b>", styles['SubHeader']))
    story.append(Paragraph("• Implementation fees capture consulting value upfront", styles['GlooBullet']))
    story.append(Paragraph("• Monthly subscriptions create recurring revenue (ARR)", styles['GlooBullet']))
    story.append(Paragraph("• Clients own their data; Gloo retains platform IP", styles['GlooBullet']))
    story.append(Paragraph("• Buyout option available after 18 months for enterprise clients", styles['GlooBullet']))

    story.append(Spacer(1, 15))

    # Key metrics box
    summary_data = [
        ['Metric', 'Year 1', 'Year 2 (Projected)'],
        ['Total Revenue', '$467,000', '$1.2M+'],
        ['ARR (Annual Recurring Revenue)', '$389,000', '$840,000'],
        ['Estimated Valuation (6x ARR)', '-', '~$5,000,000']
    ]

    summary_table = Table(summary_data, colWidths=[2.5*inch, 1.8*inch, 1.8*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -1), GLOO_DARK),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('BACKGROUND', (0, -1), (-1, -1), GLOO_LIGHT),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    story.append(summary_table)

    story.append(PageBreak())

    # Market Research
    story.append(Paragraph("2. Market Research Findings", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    story.append(Paragraph("<b>B2B SaaS Pricing Trends (2025)</b>", styles['SubHeader']))
    story.append(Paragraph("• <b>66%</b> of B2B buyers prefer subscriptions over perpetual licenses (lower upfront cost, continuous updates)", styles['GlooBullet']))
    story.append(Paragraph("• <b>38%</b> of SaaS companies now use usage-based pricing models", styles['GlooBullet']))
    story.append(Paragraph("• Subscription fatigue is driving demand for clearer value alignment", styles['GlooBullet']))
    story.append(Paragraph("• Hybrid models combining subscriptions with usage-based elements are emerging as best practice", styles['GlooBullet']))

    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Competitor Landscape</b>", styles['SubHeader']))

    competitor_data = [
        ['Competitor', 'Model', 'Starting Price', 'Target Market'],
        ['Gainsight', 'SaaS + Perpetual Option', '~$5,000/month', 'Enterprise'],
        ['ChurnZero', 'SaaS Only', '~$1,500/month', 'Mid-Market'],
        ['Gloo (Proposed)', 'Hybrid', '~$1,500/month', 'Mid-Market']
    ]

    comp_table = Table(competitor_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
        ('TOPPADDING', (0, 0), (-1, 0), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('BACKGROUND', (0, -1), (-1, -1), GLOO_LIGHT),
        ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
    ]))
    story.append(comp_table)

    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>Key Insight</b>", styles['SubHeader']))
    story.append(Paragraph(
        "Gainsight offers a perpetual license option that ChurnZero doesn't — this is a differentiator. "
        "By offering a buyout clause, Gloo can address enterprise concerns about vendor lock-in while "
        "maintaining the recurring revenue benefits of SaaS.",
        styles['GlooBody']
    ))

    story.append(PageBreak())

    # IP Structure
    story.append(Paragraph("3. Template IP Structure", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    story.append(Paragraph("<b>The \"Core + Custom\" Model</b>", styles['SubHeader']))
    story.append(Paragraph(
        "When building tools from templates (e.g., ROI Calculator), intellectual property should be layered "
        "to protect Gloo's core assets while giving clients appropriate ownership of their customizations.",
        styles['GlooBody']
    ))

    story.append(Spacer(1, 10))

    ip_data = [
        ['Layer', 'What It Includes', 'Ownership', 'Example'],
        ['Core Template', 'Base code, algorithms,\nUI framework', 'Gloo\n(Always)', 'ROI Calculator\nengine'],
        ['Client\nCustomizations', 'Features, branding,\nintegrations', 'Licensed\nto Client', 'Custom metrics,\nSalesforce integration'],
        ['Client Data', 'Numbers, configs,\ngenerated outputs', 'Client\n(Always)', 'Revenue data,\nsaved reports']
    ]

    ip_table = Table(ip_data, colWidths=[1.3*inch, 1.8*inch, 1.2*inch, 1.7*inch])
    ip_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('BACKGROUND', (2, 1), (2, 1), colors.HexColor('#DCFCE7')),  # Gloo owns - green
        ('BACKGROUND', (2, 3), (2, 3), colors.HexColor('#DCFCE7')),  # Client owns - green
        ('BACKGROUND', (2, 2), (2, 2), colors.HexColor('#FEF3C7')),  # Licensed - yellow
    ]))
    story.append(ip_table)

    story.append(Spacer(1, 20))

    story.append(Paragraph("<b>What This Means for Multiple Clients</b>", styles['SubHeader']))
    story.append(Paragraph("✓  You CAN sell the same core template to multiple clients", styles['GlooBullet']))
    story.append(Paragraph("✓  You CAN incorporate general improvements from one project into the core", styles['GlooBullet']))
    story.append(Paragraph("✗  You CANNOT give Client B the specific features built only for Client A", styles['GlooBullet']))
    story.append(Paragraph("✓  If Client A wants exclusivity on specific features, they pay a premium", styles['GlooBullet']))

    story.append(Spacer(1, 15))

    story.append(Paragraph("<b>Recommended Contract Language</b>", styles['SubHeader']))
    story.append(Paragraph(
        '"Client receives a license to use the customized tool. Gloo retains ownership of all underlying '
        'code, templates, and methodologies. Client owns all data entered into the system and may export '
        'it at any time in standard formats."',
        styles['Quote']
    ))

    story.append(PageBreak())

    # Pricing Models Compared
    story.append(Paragraph("4. Pricing Models Compared", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    # Model 1
    story.append(Paragraph("<b>Model 1: Pure Project (Ownership Transfer)</b>", styles['SubHeader']))
    story.append(Paragraph("One-time fee: $15,000 - $35,000 per tool. Client owns the customized version.", styles['GlooBody']))

    model1_data = [
        ['Metric', 'Value'],
        ['Year 1 Revenue', '$490,000'],
        ['Year 1 ARR', '$40,000 (support contracts only)'],
        ['Year 2 ARR (projected)', '$80,000'],
        ['Valuation Multiple', '1.5x revenue'],
        ['Estimated Company Value', '~$750,000']
    ]

    model1_table = Table(model1_data, colWidths=[2.5*inch, 3*inch])
    model1_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 0), (-1, -1), GLOO_DARK),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(model1_table)
    story.append(Paragraph("⚠️  Lower valuation multiple, no compounding revenue", ParagraphStyle(
        'Warning', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#DC2626'), spaceBefore=5
    )))

    story.append(Spacer(1, 15))

    # Model 2
    story.append(Paragraph("<b>Model 2: Pure SaaS (Rental Only)</b>", styles['SubHeader']))
    story.append(Paragraph("Setup: $3,000-$8,000. Monthly: $800-$2,500. Client rents access.", styles['GlooBody']))

    model2_data = [
        ['Metric', 'Value'],
        ['Year 1 Revenue', '$273,000'],
        ['Year 1 ARR', '$324,000'],
        ['Year 2 ARR (projected)', '$696,000'],
        ['Valuation Multiple', '8x ARR'],
        ['Estimated Company Value', '~$5,600,000']
    ]

    model2_table = Table(model2_data, colWidths=[2.5*inch, 3*inch])
    model2_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#DBEAFE')),
        ('TEXTCOLOR', (0, 0), (-1, -1), GLOO_DARK),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(model2_table)
    story.append(Paragraph("⚠️  Slower cash early, need to prove ongoing value for retention", ParagraphStyle(
        'Warning', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#2563EB'), spaceBefore=5
    )))

    story.append(Spacer(1, 15))

    # Model 3 - Recommended
    story.append(Paragraph("<b>Model 3: Hybrid (RECOMMENDED)</b>", styles['SubHeader']))
    story.append(Paragraph("Implementation: $8,000-$20,000. Monthly: $1,200-$2,500. Annual commitment.", styles['GlooBody']))

    model3_data = [
        ['Metric', 'Value'],
        ['Year 1 Revenue', '$467,000'],
        ['Year 1 ARR', '$389,000'],
        ['Year 2 ARR (projected)', '$840,000'],
        ['Valuation Multiple', '6x ARR'],
        ['Estimated Company Value', '~$5,000,000']
    ]

    model3_table = Table(model3_data, colWidths=[2.5*inch, 3*inch])
    model3_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D1FAE5')),
        ('TEXTCOLOR', (0, 0), (-1, -1), GLOO_DARK),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F0FDF4')),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#D1FAE5')),
    ]))
    story.append(model3_table)
    story.append(Paragraph("✓  Best of both: upfront cash + compounding ARR + strong valuation", ParagraphStyle(
        'Success', parent=styles['Normal'], fontSize=9, textColor=colors.HexColor('#059669'), spaceBefore=5, fontName='Helvetica-Bold'
    )))

    story.append(PageBreak())

    # Recommended Pricing
    story.append(Paragraph("5. Recommended Pricing Structure", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    pricing_data = [
        ['Tier', 'Implementation', 'Monthly', 'Includes'],
        ['Tier 1\nSingle Tool', '$12,000', '$1,500/mo\n(annual)', 'One customized tool\nStandard support\nQuarterly reviews'],
        ['Tier 2\nTool Bundle', '$20,000', '$2,500/mo\n(annual)', '2-3 customized tools\nPriority support\nMonthly reviews'],
        ['Tier 3\nFull Platform', '$35,000', '$4,000/mo\n(annual)', 'All current + future tools\nDedicated success manager\nWeekly reviews + SLAs'],
    ]

    pricing_table = Table(pricing_data, colWidths=[1.3*inch, 1.3*inch, 1.3*inch, 2.1*inch])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_PRIMARY),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#EEF2FF')),
        ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E0E7FF')),
        ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#C7D2FE')),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
    ]))
    story.append(pricing_table)

    story.append(Spacer(1, 25))

    story.append(Paragraph("<b>Buyout Option (Available After 18 Months)</b>", styles['SubHeader']))

    buyout_data = [
        ['Component', 'Calculation', 'Example (Tier 2)'],
        ['Perpetual License Fee', '3x Annual Subscription', '$2,500 × 12 × 3 = $90,000'],
        ['Ongoing Support (Optional)', '25% of Monthly', '$625/month'],
    ]

    buyout_table = Table(buyout_data, colWidths=[2*inch, 2*inch, 2*inch])
    buyout_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    story.append(buyout_table)

    story.append(Spacer(1, 10))
    story.append(Paragraph(
        "Note: Buyout provides perpetual license to the customized version only. Gloo retains core template IP. "
        "Client can continue using the tool indefinitely but will not receive future platform updates.",
        ParagraphStyle('Note', parent=styles['Normal'], fontSize=8, textColor=colors.HexColor('#6B7280'), leading=11)
    ))

    story.append(PageBreak())

    # Sales Script
    story.append(Paragraph("6. Sales Positioning", styles['SectionHeader']))
    story.append(HRFlowable(width="100%", thickness=1, color=GLOO_LIGHT, spaceAfter=15))

    story.append(Paragraph("<b>When Prospects Ask: \"Do I Own It?\"</b>", styles['SubHeader']))
    story.append(Spacer(1, 10))

    # Script box
    script_text = (
        '"You always own your data — it\'s exportable anytime in standard formats. You\'re subscribing '
        'to our platform because that gives you continuous improvements, security updates, and support '
        'without managing infrastructure yourself. Think of it like leasing a car with full service '
        'included versus buying and maintaining it yourself. And if you ever want to bring it fully '
        'in-house, we have a buyout path after 18 months."'
    )

    story.append(Table(
        [[Paragraph(script_text, ParagraphStyle(
            'ScriptText',
            parent=styles['Normal'],
            fontSize=11,
            textColor=GLOO_DARK,
            leading=16,
            fontName='Helvetica-Oblique'
        ))]],
        colWidths=[6*inch],
        style=TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), GLOO_LIGHT),
            ('BOX', (0, 0), (-1, -1), 2, GLOO_PRIMARY),
            ('TOPPADDING', (0, 0), (-1, -1), 15),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
            ('LEFTPADDING', (0, 0), (-1, -1), 15),
            ('RIGHTPADDING', (0, 0), (-1, -1), 15),
        ])
    ))

    story.append(Spacer(1, 25))

    story.append(Paragraph("<b>Key Differentiators to Emphasize</b>", styles['SubHeader']))
    story.append(Paragraph("1. <b>Data ownership is non-negotiable</b> — clients always own and can export their data", styles['GlooBullet']))
    story.append(Paragraph("2. <b>Lower total cost</b> — vs. Gainsight's $60K+/year with 6-month implementation", styles['GlooBullet']))
    story.append(Paragraph("3. <b>Flexibility</b> — buyout option that competitors don't offer", styles['GlooBullet']))
    story.append(Paragraph("4. <b>Continuous value</b> — platform improvements, not a static tool that ages", styles['GlooBullet']))
    story.append(Paragraph("5. <b>Low risk</b> — prove value before long-term commitment", styles['GlooBullet']))

    story.append(Spacer(1, 25))

    story.append(Paragraph("<b>Handling Common Objections</b>", styles['SubHeader']))

    objections_data = [
        ['Objection', 'Response'],
        ['"We need to own it for\nsecurity/compliance"', 'Your data stays in your control. We can discuss on-premise\ndeployment options for enterprise (Tier 3+).'],
        ['"We don\'t want to be\nlocked in"', '18-month buyout option + data export anytime.\nNo lock-in, just ongoing value.'],
        ['"One-time cost fits\nour budget better"', 'Implementation fee can be larger, subscription smaller.\nWe\'re flexible on the split.'],
        ['"What if you go\nout of business?"', 'Escrow agreement available for Tier 3.\nSource code held by third party.'],
    ]

    obj_table = Table(objections_data, colWidths=[1.8*inch, 4.2*inch])
    obj_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), GLOO_DARK),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Oblique'),
        ('TEXTCOLOR', (0, 1), (0, -1), colors.HexColor('#6B7280')),
    ]))
    story.append(obj_table)

    # Build PDF
    doc.build(story)
    print("PDF created successfully: Gloo-Pricing-Strategy.pdf")

if __name__ == "__main__":
    create_pdf()
